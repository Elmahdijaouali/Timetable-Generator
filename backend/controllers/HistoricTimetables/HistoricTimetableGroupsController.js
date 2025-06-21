const { transform} = require('./../../helpers/transformers/timetableGroupsTransformer.js')
const {Timetable , Group , Branch} = require('./../../models')
const { Sequelize} = require('sequelize')

const index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  

    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Timetable.findAndCountAll({
            where: {
                status: "archived" , 
              

            },
            include: [
                {
                    model: Group,
                    as: 'group',
                    include: [
                        { model: Branch, as: "branch" }
                    ]
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']] 
        });

        const data = rows.map(timetable => transform(timetable));

        return res.json({
            page,
            limit,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            data
        });

    } catch (err) {
        console.log(err);
        return res.status(400).json({ errors: 'Error: ' + err.message });
    }
}

const filterTimetableHistoric = async (req , res ) => {
   const valid_form = req.query.valid_form ;
   if(!valid_form){
      return res.json({ "errors" : 'valid_form field is required for filter !'})
   }

    try{
      return res.json(new Date(valid_form))
      const timetables = await Timetable.findAll({
        where : {
           status: "archived" , 
          //  valid_form : new Date(valid_form)
          valid_form : "2025-05-17T00:00:00.000Z"
        }
      })

      return res.json(timetables)

    }catch(err){
       console.log(err)
        return res.status(400).json({ errors: 'Error: ' + err.message });
    }
}


const getAllUniqueValidFromDates = async (req, res) => {
    try {
        const dates = await Timetable.findAll({
            where: {
                status: "archived"
            },
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('valid_form')), 'valid_form']
            ],
            order: [['valid_form', 'DESC']],
            raw: true
        });

        const uniqueDates = dates.map(d => new Date(d.valid_form).toLocaleDateString() );

       return res.json(uniqueDates);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error' +err });
    }
};

module.exports = { index , getAllUniqueValidFromDates , filterTimetableHistoric}