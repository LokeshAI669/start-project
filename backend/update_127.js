require('dotenv').config();
const { pool } = require('./server/db');

async function updateProject() {
  const full_description = "This project conducts a comprehensive comparative analysis of various deep neural network (DNN) architectures for the automated detection and classification of brain tumors from MRI scans. Brain tumor diagnosis is a critical, time-sensitive medical procedure, and automating this process can significantly assist radiologists.\n\nThe study evaluates state-of-the-art models such as ResNet, VGG16, and custom Convolutional Neural Networks (CNNs). By preprocessing raw MRI datasets using techniques like skull stripping, image normalization, and data augmentation, the models are trained to detect tumors with high accuracy. The project compares these architectures based on their precision, recall, F1-score, and computational efficiency to determine the most viable model for real-world clinical deployment.";

  const tech_stack = "Python, TensorFlow, Keras, OpenCV, Jupyter Notebook";
  const estimated_duration = "6 - 8 Weeks";
  const objectives = [
    "Preprocess and normalize brain MRI datasets",
    "Implement and train multiple Deep Learning architectures (CNN, ResNet, VGG)",
    "Evaluate and compare model performance using precision and recall metrics",
    "Develop a basic web interface to upload an MRI and predict results"
  ];
  const prerequisites = "Familiarity with Python, basic understanding of Convolutional Neural Networks (CNNs), and experience with image processing libraries like OpenCV.";

  try {
    await pool.query(
      `UPDATE project_catalog SET 
        full_description = $1, 
        tech_stack = $2, 
        estimated_duration = $3, 
        objectives = $4, 
        prerequisites = $5 
       WHERE id = 127`,
      [full_description, tech_stack, estimated_duration, objectives, prerequisites]
    );
    console.log("Successfully updated Project 127 with realistic details!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

updateProject();
