const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const { 
    Exercitii, Capitole, Subcapitole, 
    Teste, AsociereEt 
  } = require("../models");
const { spawn } = require("child_process");

const BASE_URL = "http://localhost:8000/pdfs";

const latexHeaderTest = `
\\documentclass[12pt]{extarticle}
\\usepackage{newtxtext,newtxmath}
\\usepackage[a4paper, left=2.5cm, right=2.5cm, top=3cm, bottom=3cm]{geometry}
\\usepackage{amsmath}
\\usepackage{fancyhdr}
\\usepackage{pgfplots}
\\usepackage{tikz}
\\usepackage{needspace}
\\usetikzlibrary{calc}
\\pgfplotsset{compat=1.18}

\\pagestyle{fancy}
\\fancyhf{} % elimină anteturile și subsolurile implicite
\\renewcommand{\\headrulewidth}{0pt} 
\\fancyfoot[C]{\\thepage}

\\begin{document}
\\begin{center}
\\textbf{\\huge TEST DE EVALUARE}\\\\[1mm]
\\end{center}
\\vspace{3cm}
{\\large \\textbf{Total: 100 puncte (10 puncte din oficiu).}}
\\vspace{2cm}
`;

const latexHeaderBarem = `
\\documentclass[12pt]{extarticle}
\\usepackage{newtxtext,newtxmath}
\\usepackage[a4paper, left=2.5cm, right=2.5cm, top=3cm, bottom=3cm]{geometry}
\\usepackage{amsmath}
\\usepackage{fancyhdr}
\\usepackage{pgfplots}
\\usepackage{tikz}
\\usepackage{needspace}
\\usetikzlibrary{calc}
\\pgfplotsset{compat=1.18}

\\pagestyle{fancy}
\\fancyhf{} % elimină anteturile și subsolurile implicite
\\renewcommand{\\headrulewidth}{0pt} 
\\fancyfoot[C]{\\thepage}

\\begin{document}
\\begin{center}
\\textbf{\\huge BAREM DE CORECTARE}\\\\[1mm]
\\end{center}
\\vspace{3cm}
{\\large \\textbf{Total: 100 puncte (10 puncte din oficiu).}}
\\vspace{2cm}
`;

const latexFooter = `
\\end{document}
`;

const chapterConfig = {
    1: 3,
    2: 2,
    3: 2,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 2,
    9: 1,
    10: 2,
    11: 2,
};

function getRandomItems(arr, count) {
    if (count > arr.length) return null;
    const copy = [...arr];
    const ret = [];
    for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * copy.length);
        ret.push(copy[index]);
        copy.splice(index, 1);
    }
    return ret;
}

function generateFileName(prefix) {
    const randomPart = Math.floor(Math.random() * 10000);
    return `${prefix}_${Date.now()}_${randomPart}.tex`;
}

exports.generateTest = async (req, res) => {
    try {
        const professorId = req.user.id;
        const { titlu } = req.body;
        const exercisesChosen = [];
        let testDocumentContent = latexHeaderTest;
        let baremContent = latexHeaderBarem;

        let exerciseCounter = 1;

        for (const [chapterId, requiredCount] of Object.entries(chapterConfig)) {
            const subchapters = await Subcapitole.findAll({
                where: { idcapitol: chapterId }
            });

            if (subchapters.length < requiredCount) {
                return res.status(400).json({
                    error: `Nu sunt suficiente subcapitole pentru capitolul ${chapterId}.`
                });
            }

            const selectedSubchapters = getRandomItems(subchapters, requiredCount);

            for (const sub of selectedSubchapters) {
                const exercise = await Exercitii.findOne({
                    where: {
                        capitol: chapterId,
                        subcapitol: sub.idsubcapitol
                    },
                    order: [ Sequelize.literal('RANDOM()') ]
                });

                if (!exercise) {
                    return res.status(400).json({
                        error: `Nu a fost găsit niciun exercițiu pentru capitolul ${chapterId} si subcapitolul ${sub.idsubcapitol}.`
                    });
                }

                exercisesChosen.push(exercise.idexercitiu);

                    testDocumentContent += `\\needspace{10\\baselineskip}`;
                    testDocumentContent += `\\noindent (5P)  \\textbf{${exerciseCounter}}. ${exercise.cerinta}\n\n`;
                    testDocumentContent += `\\vspace{0.5cm}`;
                    baremContent += `\\needspace{10\\baselineskip}`;
                    baremContent += `\\noindent (5P)  \\textbf{${exerciseCounter}}. ${exercise.rezolvare}\n\n`;
                    baremContent += `\\vspace{0.5cm}`;



                exerciseCounter++;
            }
        }

        testDocumentContent += latexFooter;
        baremContent += latexFooter;

        const docFileName = generateFileName("test_doc");
        const baremFileName = generateFileName("test_barem");

        const docFilePath = path.join(__dirname, "../doc_gen", docFileName);
        const baremFilePath = path.join(__dirname, "../doc_gen", baremFileName);

        fs.writeFileSync(docFilePath, testDocumentContent);
        fs.writeFileSync(baremFilePath, baremContent);

        const runPdflatex = (texPath) => {
            return new Promise((resolve, reject) => {
                const timeoutMs = 10000;
                const pdflatex = spawn("pdflatex", [
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "-output-directory", path.dirname(texPath),
                    texPath
                ]);

                let stderr = "";
                let stdout = "";

                const timer = setTimeout(() => {
                    pdflatex.kill("SIGKILL");
                    reject(new Error("pdflatex timed out or hung."));
                }, timeoutMs);

                pdflatex.stdout.on("data", (data) => { stdout += data.toString(); });
                pdflatex.stderr.on("data", (data) => { stderr += data.toString(); });

                pdflatex.on("close", (code) => {
                    clearTimeout(timer);
                    if (code === 0) {
                        resolve(texPath.replace(".tex", ".pdf"));
                    } else {
                        console.error("pdflatex stderr:\n", stderr);
                        console.error("pdflatex stdout:\n", stdout);
                        reject(new Error(`pdflatex failed with code ${code}`));
                    }
                });

                pdflatex.on("error", (err) => {
                    clearTimeout(timer);
                    reject(err);
                });
            });
        };

        let testPDF, baremPDF;
        try {
            testPDF = await runPdflatex(docFilePath);
            baremPDF = await runPdflatex(baremFilePath);
        } catch (conversionError) {
            console.error("Error converting LaTeX to PDF: ", conversionError);
            return res.status(500).json({ error: "Eroare la generarea PDF-ului." });
        }

        const cleanupFiles = [
            docFilePath, baremFilePath,
            docFilePath.replace('.tex', '.aux'),
            docFilePath.replace('.tex', '.log'),
            baremFilePath.replace('.tex', '.aux'),
            baremFilePath.replace('.tex', '.log')
        ];

        try {
            for (const file of cleanupFiles) {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            }
        } catch (cleanupError) {
            console.warn("Warning: Failed to clean up some LaTeX files", cleanupError);
        }

        const newTest = await Teste.create({
            idprofesor: professorId,
            tip: "Generat",
            datacreatie: new Date(),
            notamaxima: 10,
            document: `${BASE_URL}/${path.basename(testPDF)}`,
            barem: `${BASE_URL}/${path.basename(baremPDF)}`,
            titlu
        });

        for (const exerciseId of exercisesChosen) {
            await AsociereEt.create({
                idtest: newTest.idtest,
                idexercitiu: exerciseId,
                punctaj: null
            }); 
        }

        res.status(201).json({ message: "Test generat cu succes!", test: newTest });
    } catch (error) {
        console.error("Eroare la generarea testului:", error);
        res.status(500).json({ error: "Eroare la generarea testului.", details: error.message });
    }
};

exports.getTestsForProfessor = async (req, res) => {
    try {
        const professorId = req.user.id;
        const tests = await Teste.findAll({ where: { idprofesor: professorId } });
        res.json(tests);
    } catch (error) {
        console.error("Eroare la obținerea testelor:", error);
        res.status(500).json({ error: "Eroare la obținerea testelor." });
    }
};




exports.addExercise = async (req, res) => {
    try {
        const { capitol, subcapitol, cerinta, rezolvare } = req.body;
        
        if (!capitol || !subcapitol || !cerinta || !rezolvare) {
            return res.status(400).json({ error: "Toate câmpurile sunt necesare." });
        }
        
        const newExercise = await Exercitii.create({
            capitol,
            subcapitol,
            punctaj: 5,
            cerinta,
            rezolvare
        });
        
        res.status(201).json({ message: "Exercițiu adăugat cu succes!", exercise: newExercise });
    } catch (error) {
        res.status(500).json({ error: "Eroare la adăugarea exercițiului.", details: error.message });
    }
};

exports.getExercises = async (req, res) => {
    try {
        const exercises = await Exercitii.findAll({
            include: [
                { model: Capitole, as: "capitolInfo", attributes: ["nume"] },
                { model: Subcapitole, as: "subcapitolInfo", attributes: ["nume"] }
            ],
            order: [
                ['capitol', 'ASC'],  
                ['subcapitol', 'ASC']  
            ]
        });

        const formattedExercises = exercises.map(ex => ({
            id: ex.idexercitiu,
            capitol: ex.capitolInfo ? ex.capitolInfo.nume : "N/A",
            subcapitol: ex.subcapitolInfo ? ex.subcapitolInfo.nume : "N/A",
            cerinta: ex.cerinta,
            rezolvare: ex.rezolvare
        }));

        res.json(formattedExercises);
    } catch (error) {
        console.error("Eroare la obținerea exercițiilor:", error);
        res.status(500).json({ error: "Eroare la obținerea exercițiilor." });
    }
};

exports.delete = async(req, res)=>{
    const { id } = req.params;

  try {
    const test = await Teste.findByPk(id);
    if (!test) {
      return res.status(404).json({ error: 'Testul nu a fost găsit' });
    }

    const filesToDelete = [test.document, test.barem];

    filesToDelete.forEach(fileUrl => {
      if (fileUrl) {

        const filename = path.basename(fileUrl);
    

        const fullPath = path.join(__dirname, '..', 'doc_gen', filename);
    
 
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.warn(`Nu a fost șters fișierul: ${fullPath}`, err.message);
          }
        });
    }
    });

    await test.destroy();
    res.json({ message: 'Test șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea testului:', error);
    res.status(500).json({ error: 'Eroare internă de server' });
  }
}