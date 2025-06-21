const XLSX = require("xlsx");
const { Classroom, Formateur } = require("../../models");

const importDataClassroom = async (req, res) => {
  if (!req.file) {
    return res.status(422).json({ errors: " file not upload !" });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    if (
      !rows[0]["Salle"] &&
      !rows[0]["Mle Formateur"] &&
      !rows[0]["Formateur"]
    ) {
      return res.status(422).json({"errors" : 'file inccrect !!'})
    }
    for (let row of rows) {
      if (row["Salle"] && row["Mle Formateur"] && row["Formateur"]) {
        await Classroom.upsert({
          label: row["Salle"],
        });

        const classroom = await Classroom.findOne({
          where: { label: row["Salle"] },
        });
        await Formateur.upsert({
          mle_formateur: row["Mle Formateur"],
          name: row["Formateur"],
          classroomId: classroom.id,
        });
      }
    }
  } catch (err) {
    console.log("error");
    res.status(422).json({ errors: err });
  }

  return res.json({ message: "sucessfuly imporatation" });
};

module.exports = { importDataClassroom };
