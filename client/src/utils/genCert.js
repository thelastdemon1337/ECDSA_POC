// const fs = require('fs');
import fs from 'fs'
// const Docxtemplater = require('docxtemplater');
import {Docxtemplater} from 'docxtemplater'
import {PizZip} from 'pizzip'
// const PizZip = require('pizzip');

export const genCert = () => {
  // Load the template file
  console.log("Initiating cert generation script")
const temp_path = "/Users/admin/Desktop/Transcripts-Verification/client/src/utils/VERIFIED_template.docx"
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
const name = 'Tarun Kotagiri'
const reg_id = '170925'
const yop = '2023'
const col_name = 'Woxsen University'
const date = new Date().toLocaleDateString("en-IN");

const data = {
  name: name,
  reg_id : reg_id,
  yop : yop,
  col_name : col_name,
  date : date
};
// doc.setData(data);
doc.render(data);

// Save the generated document
const dir_path = '/Users/admin/Desktop/Transcripts-Verification/GCerts/'
const outputPath = dir_path + 'certificate-' + name + '.docx';
const buffer = doc.getZip().generate({ type: 'nodebuffer' });
fs.writeFileSync(outputPath, buffer);

console.log('Certificate generated:', outputPath);
return outputPath
}
// genCert()