const express = require("express");
const dotenv = require("dotenv");
const authRouter = require("./routes/api/v1/auth.js");
const importDataRouter = require("./routes/api/v1/importData.js");
const generateRouter = require("./routes/api/v1/generate.js");
const testRouter = require("./routes/api/v1/test.js");
const classroomRouter = require("./routes/api/v1/classroom.js");
const timetableFormateurRouter = require("./routes/api/v1/timetableFormateur.js");
const groupRouter = require('./routes/api/v1/group.js')
const branchRouter = require('./routes/api/v1/branch.js')
const mergeRouter = require('./routes/api/v1/merge.js')
const timetableGroupRouter = require('./routes/api/v1/timetableGroup.js')
const timetableActiveFormateurRouter = require('./routes/api/v1/timetableActiveFormateur.js')
const timetableActiveClassroomRouter = require('./routes/api/v1/timetableClassroom.js')
const historicTimetablesRouter = require('./routes/api/v1/timetableHistoric.js')
const groupsEnStageRouter = require('./routes/api/v1/groupsEnStage.js')
const formateurRouter = require('./routes/api/v1/formateur.js')

const cors = require("cors");
const { sequelize } = require("./models/index.js");

dotenv.config();
const app = express();
app.use(express.json());
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 8002;
const fix_path = "/api/v1";


app.use(fix_path, authRouter);
app.use(fix_path, importDataRouter);
app.use(fix_path, generateRouter);
app.use(fix_path, testRouter); 
app.use(fix_path, classroomRouter);
app.use(fix_path, timetableFormateurRouter);
app.use(fix_path, groupRouter);
app.use(fix_path, branchRouter);
app.use(fix_path, mergeRouter);
app.use(fix_path, timetableGroupRouter);
app.use(fix_path, timetableActiveFormateurRouter);
app.use(fix_path, timetableActiveClassroomRouter);
app.use(fix_path, historicTimetablesRouter);
app.use(fix_path, groupsEnStageRouter);
app.use(fix_path, formateurRouter);

app.listen(PORT, () => {
  console.log("server is runing!");
});
