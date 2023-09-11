const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  yearOfPassing: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  cert_hash: {
    type: String,
    required: true,
  }
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
