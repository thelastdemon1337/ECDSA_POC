const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');

const dir_path = './Certs/'
function genCert(regNo, stu_name, yearOfPassing, collegeName) {
  // Load the template file
  console.log("Initiating cert generation script")
  const temp_path = "./Certs/VERIFIED_template.docx"
  const templateContent = fs.readFileSync(
    temp_path,
    'binary');
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  // doc.loadZip(zip);

  // Replace template variables
  // const name = 'Tarun'
  // const reg_id = '170925'
  // const yop = '2023'
  // const col_name = 'Woxsen University'
  const date = new Date().toLocaleDateString("en-IN");

  const data = {
    name: stu_name,
    reg_id: regNo,
    yop: yearOfPassing,
    col_name: collegeName,
    date: date
  };
  // doc.setData(data);
  doc.render(data);

  // Save the generated document
 
  const outputPath = dir_path + 'certificate-' + data.name + '.docx';
  const buffer = doc.getZip().generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, buffer);

  console.log('Certificate generated:', outputPath);
  return [outputPath, data.name]
}

function delCert(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('File deleted successfully from temp storage.');
    }
  });
}

module.exports = { genCert, delCert }