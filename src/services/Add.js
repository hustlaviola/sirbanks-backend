// /* eslint-disable require-jsdoc */
// /* eslint-disable no-plusplus */
// import fs from 'fs';
// import util from 'util';
// import path from 'path';

// import Make from '../models/Make';
// import Model from '../models/Model';

// const writeFile = util.promisify(fs.writeFile);
// const readFile = util.promisify(fs.readFile);
// const filePath = path.join(__dirname, '../../car.json');

// export default class QuestionService {
//     static saveQuestions(questions) {
//         return writeFile(filePath, questions);
//     }

//     static getAll() {
//         return readFile(filePath);
//     }

//     static async addCars() {
//         console.log('=============================', filePath);
//         const makeNModel = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//         // const makeNModel = JSON.parse(await QuestionService.getAll());
//         console.log('=============================', makeNModel.length);
//         const makees = [];
//         const mmm = [];
//         // eslint-disable-next-line array-callback-return
//         makeNModel.forEach(mod => {
//             if (!makees.includes(mod.Make)) {
//                 makees.push(mod.Make);
//                 mmm.push({ name: mod.Make });
//             }
//         });
//         console.log('=============================', mmm.length);
//         // return;
//         return Make.insertMany(mmm);
//     }

//     static async addModels() {
//         console.log('=============================', filePath);
//         const makeNModel = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//         // const makeNModel = JSON.parse(await QuestionService.getAll());
//         console.log('=============================', makeNModel.length);
//         const makees = [];
//         // const mmm = [];
//         // eslint-disable-next-line array-callback-return
//         // makeNModel.forEach(mod => {
//         //     if (!makees.includes(mod.Make)) {
//         //         makees.push(mod.Make);
//         //         mmm.push({ name: mod.Make });
//         //     }
//         // });
//         const makes = await Make.find();
//         makes.forEach(mm => {
//             const mjmdd = [];
//             makeNModel.forEach(mNm => {
//                 if (mNm.Make === mm.name) {
//                     mjmdd.push(mNm);
//                 }
//             });
//             const models = [];
//             mjmdd.forEach(mjm => {
//                 if (!models.includes(mjm.Model)) {
//                     models.push(mjm.Model);
//                 }
//             });
//             models.forEach(mom => {
//                 makees.push({
//                     make: mm.id,
//                     name: mom
//                 });
//             });
//         });
//         console.log('=============================', makees.length);
//         return Model.insertMany(makees);
//     }

//     static async getOne(id) {
//         const questions = JSON.parse(await QuestionService.getAll());
//         const question = questions.find(quest => quest.id === id);
//         return question;
//     }

//     static async getFifteenQuestions() {
//         const questions = JSON.parse(await QuestionService.getAll());
//         const allQuestions = [...questions];
//         let len = allQuestions.length;
//         if (len < 15) return false;
//         let count = 15;
//         const fifteenQuestions = [];
//         while (count) {
//             const randomIndex = Math.floor(Math.random() * len);
//             fifteenQuestions.push(allQuestions.splice(randomIndex, 1)[0]);
//             len--;
//             count--;
//         }
//         return fifteenQuestions;
//     }
// }
