require('dotenv').config();
const { pool } = require('./server/db');

const rawData = `
S.No Machine Learning 
1 Binary Image Classification Using Machine Learning and Deep Quantum Neural Networks
2 Analysis and Prediction of Electric Vehicle Costs: A Machine Learning Based Approach
3 Prediction Correction Line Segment Detection
4 Machine Learning Model to Predict Results of Law Cases
5 Machine Learning Technique for Phishing Website Detection
6 Machine Learning Algorithms for Unbalanced Dataset Promotion Prediction for Employees
7 Injury Risk Prediction in Soccer Using Machine Learning
8 Applying Machine Learning for Sleep Disorder Classification
9 Machine Learning Model for Forecasting the Rating of Mobile Apps
10 Real Estate Price Prognostication through Machine Learning Models
11 Analysis of Machine Learning Based Credit Card
12 Enhancing Kyphosis Disease Prediction Evaluating Machine Learning Algorithms
13 Development of an Early Warning System to Support Education Planning Process by Identifying At-risk Students
14 Deep Reinforcement Learning-based Malicious URL Detection
15 Multi-Modal Hate Speech Recognition Through Machine Learning
16 Machine Learning Based Approaches for Livestock Symptoms and Diseases Prediction
17 Alzheimer’s Disease Prediction Using Modern Machine Learning Techniques
18 Prediction of Vehicle Carbon Emission Using Machine Learning
19 Analysis and Prediction of Employee Promotions
20 Predicting Employee Attrition Using Machine Learning
21 Analysis of Used Vehicle Value Prediction Using Machine Learning
22 Dynamic Pricing Prediction with Machine Learning Algorithm
23 Analysis-of-Women-Safety-in-Indian-Cities-Using-Twitter-data
24 Milk  Quality Prediction Using ML
25 Flood Prediction using Supervised Machine Learning Algorithms
26 Butterfly Classification
27 Mobile Price Range Estimater
28 Flight Delay Prediction Using Machine Learning Techniques
29 Early risk prediction of cervical cancer: A machine learning approach
30 Offensive Language Detection on social media Based on Text Classification
31 Benchmarking Probabilistic Deep Learning Methods for License Plate Recognition
32 Efficient Data-driven Machine Learning Models for Hypertension Risk Prediction
33 Depression detection using machine learning on twitter
34 An Enhanced Segmentation and Deep Learning Architecture for Early Diabetic Retinopathy Detection
35 Inspecting Mega Solar Plants through Computer Vision and Drone Technologies
36 Leaf and spike wheat disease & classification using improved
37 WATER QUALITY PREDICTION USING MACHINE LEARNING
38 PREDICTING ACCEPTANCE OF THE BANK LOAN OFFERS BY USING SVM
39 Ransomware Classification and Detection with Machine Learning Algorithms

Artificial Intelligence 
40 Advanced Machine Learning Techniques for Enhancing Data Security in Cloud Computing Systems
41 MODEL-BASED LEARNING FOR LOCATION-TO-CHANNEL MAPPING
42 Antenna Performance Prediction
43 Clinical Text Classification Using Sequential Forward Selection
44 Generative Artificial Intelligence in Teaching
45 AI Perspective in Digital Healthcare Ownership versus Practicality
46 Improving Ethical Considerations in GenAI

DEEP LEARNING 
47 Classification of Grapevine Leaf Images with Deep Learning Ensemble Models
48 Classification of Channel Encoders Using Convolutional Neural Network
49 Consumer Complaints Classification using Deep Learning amp Word Embedding Models
50 Detection of ground holes using Deep Learning for surveillance.
51 Hybridizing Convolutional Neural Networks and Support Vector Machines for Mango ripeness
52 Deep Learning abnormal Event Detection in Pedestrian Pathways
53 Applications of Deep Learning Algorithms for Object Detection in Real-time Drone
54 Deep crack A Deep Learning Approach for Image-Based Crack Prediction
55 Deep Learning Framework for Automated Drug Resistance Prediction of Tuberculosis
56 Islanding Detection Using Transformer Neural Networks
57 Railway Track Detection Based on SegNet Deep Learning
58 Drug System Supply Chain Management
59 Comparative Analysis of Machine Learning Methods for Multi-Label Skin Cancer Classification
60 Implementation of Text-to-image Generators in the Development of the usability interface for the construction of a webpage.
61 Methods of signal to image transformation in Photovoltaic Fault Diagnosis in Preparation for machine learning application
62 Trash and Recycle Material identification using Deep Learning
63 Automated Road Damage Detection Using UAV Images and Deep Learning Techniques
64 EEG Based Human Emotion Recognition Using Deep Learning
65 Comparative Analysis of Deep Learning Models for Potato Leaf Disease Detection.
66 Underwater Image Enhancement via Weighted Wavelet Visual Perception Fusion.
67 Efficient Shelf Monitoring System using Faster-RCNN
68 Acute lymphoblastic leukemia Classification Based on Convolutional Neural Network
69 An Improved Tomato Ripeness Detection and Sorting System
70 Advancing Workplace Safety A Deep Learning
71 Elephant trespassing alert system using deep learning
72 Detecting and Diagnosing Brain Tumor MRI Image
73 Anthracnose Detection and Classification in Chili Leaves
74 Deep Learning-Based Web Application for Real-Time Apple Leaf Disease Detection
75 VidSum Video Summarization using Deep learning
76 Microorganism Image Recognition
77 A Systematic Approach to Detect Insider Attacks and
78 Deep Learning based age and gender detection using facial images
79 Thyroid Nodules Detection Deep Reinforcement learning
80 crop stress analysis and detection using deep learning
81 Comparing and Combining Audio Processing and Deep Learning Features for Classification of Heartbeat Sounds
82 Kidney Stone Detection Using CNN
83 Light-Weight Deep Learning Model for Human action recognition in videos.

Power Theft and Energy Fraud Detection 
84 Significance of Data Augmentation in Identifying Plant Diseases using Deep Learning
85 Detecting Car Speed using Object Detection
86 Football Player Detection and Tracking
87 Bone Abnormality Detection
88 A Comprehensive Study on the Classification of the Edibility of Mushrooms
89 Classification OF Shells OR Pebbles
90 Malaria Parasite Detection using 2D CNN

NATURAL LANGUAGE PROCESSING 
91 Political Tweet Sentiment Analysis For Public Opinion Polling
92 A Contextual Relational Model for Deceptive Opinion Spam Detection
93 Investigating Evasive Techniques in SMS Spam Filtering A Comparative Analysis of Machine Learning
94 Comparative Analysis of Machine Learning and Deep Learning Techniques in Text Based emotion detection.
95 Comparative Study of Algorithms for Sentiment Analysis on IMDB Movie Reviews
96 Spam detection using text clustering
97 Design of Deep Learning Mixed Language Short Text Sentiment Classification System
98 Next word prediction
99 Sentiment Analysis in Emergency Calls for Exploring Natural Language Processing for Enhanced Police Dispatch Services
100 A Multi-Model Intelligent Approach for Rumor Detection in Social Networks
101 Clinical Text Classification Using Sequential Forward Selection
102 Lockdown Sentiment Analysis Using NLP
103 Analysis of Suicide Attempt review using machine learning
104 Language Detection Using NLP
105 Darknet Traffic Analysis Investigating the Impact of modified tor traffic on onion service traffic classification
106 Suicidal Ideation Detection Application of Machine Learning Techniques on Twitter Data

CYBER SECURITY 
107 Enhancing Cyber Resilience with AI-Powered Cyber Insurance Risk Assessment
108 Cyber Security Posterior Distribution
109 A Comprehensive Analysis and Solutions for Enhancing SCADA Systems Security in Cloud
110 Checking Security Properties of Cloud Service REST APIs
111 Detecting Cyber-Attacks Against Cyber Physical Manufacturing System A Machining Process Invariant Approach
112 AI-Based Cybersecurity Policies and Procedures
113 Performance Analysis of Blockchain-Enabled Security and Privacy Algorithms in Connected and Autonomous Vehicles A Comprehensive Review
114 Investigations on Cyber Security Vulnerability using Distribution Analysis
115 An Analytical Study on Cyber Security Awareness

MIXED
116 Prediction of Blood Lactate Levels in Children after Cardiac Surgery using Machine Learning Algorithms
117 Liver Disease Prediction using Machine learning Classification Techniques
118 Detection of Mental State from EEG Signal Data: An Investigation with Machine Learning Classifiers
119 Image Data Augmentation for Deep Learning: A Survey
120 An Artificial Intelligence System for Detecting the Types of the Epidemic from X-rays
121 Predicting Chronic Kidney Disease Using Machine Learning Algorithms
122 Pcos(polycystic ovarian syndrome) detection
123 A Comparative Study on Fake Job Post Prediction Using Different Data mining Techniques
124 Car Traffic Sign Recognizer Using Convolutional Neural Network CNN
125 Drug Recommendation System based on Sentiment Analysis of Drug Reviews using Machine Learning
126 Optimization of Regression algorithms using Learning curve in WSN
127 A Comparative Analysis of Deep Neural Networks for Brain Tumor Detection
128 Human Activity Recognition Through Ensemble Learning of Multiple Convolutional Neural Networks
129 Rainfall Prediction using Multiple Linear Regressions Model
130 An Efficient Approach for Interpretation of Indian Sign Language using Machine Learning
131 Machine Learning Based Predictive Mechanism for Internet Bandwidth
132 Utilizing Machine Learning to Predict Happiness Index
133 Enhancing Multi-Class Classification in One-Versus-One Strategy: A Type of Base Classifier Modification and Weighted Voting Mechanism
134 Design and Implementation of E-commerce Recommendation System Model Based on Cloud Computing
135 Predicting Student’s Failure in Education Based on Dropout Status
136 Application of Data Mining in Predicting College Graduates Employment
137 An Electricity Load Forecasting Algorithm Based on Kernel Lasso Regression
138 Deepfakes Creation and Detection Using Deep Learning
139 Review on evaluation techniques for better student learning outcomes using machine learning.
140 Implementation of Grey Scale Normalization in Machine Learning & Artificial Intelligence for Bioinformatics using Convolutional Neural Networks
141 Analysis of A Mixed Neural Network Based on CNN and RNN for Computational Model of Sensory Cortex
142 Bone Deformity Identification Using Machine Learning
143 Improved deep learning model text classification
144 Analysis of Doppler Collision Prediction using Supervised Machine Learning
145 Detecting Fake News Using Machine Learning Algorithms
146 EXPLORING MACHINE LEARNING TECHNIQUE FOR EARLY DETECTION
147 Forest Fire Detection and Protection Based on Convolutional Neural Network Using Deep learning Models
148 Air Quality Prediction based on Machine Learning
149 Agriculture Soil Analysis, Classification and Crop Suitability Recommendation Using Machine Learning
150 Music Genre Classification Using Convolutional Neural Network
151 Machine learning based on house price prediction using modified extreme boosting
152 A Machine Learning Model to Classify Indian Taxi System in Tourism Industry
153 Cancer Death Cases Forecasting using Supervised Machine Learning
154 Machine Learning Based Patient Classification In Emergency Department
155 Scrutinizing Machine Learning Models For Cancer Prediction
156 Sentiment Analysis Study of Human Thoughts using Machine Learning Techniques
157 Machine Learning-based Weather Prediction: A Comparative Study of Regression and Classification Algorithms
158 Automatic English Essay Scoring Algorithm Based on Machine Learning
159 APD - ML: AIR POLLUTION DETECTION USING MACHINE LEARNING ALGORITHMS
160 Comparative Analysis of Machine Learning and Deep Learning Techniques in Text Based Emotion Detection
161 Multiple Disease Prediction Based on User Symptoms using Machine Learning Algorithms
162 Sentiment Polarity Detection Using Machine Learning and Deep Learning
163 Research on Artificial Intelligence Deep Learning to Identify Plant Species
`;

async function run() {
  const lines = rawData.split('\n');
  let currentDomain = 'Machine Learning';
  const projects = [];

  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;

    // Detect domain headers
    if (text === 'Machine Learning' || text.includes('S.No Machine Learning')) { currentDomain = 'Machine Learning'; continue; }
    if (text === 'Artificial Intelligence') { currentDomain = 'Artificial Intelligence'; continue; }
    if (text === 'DEEP LEARNING') { currentDomain = 'Deep Learning'; continue; }
    if (text === 'Power Theft and Energy Fraud Detection') { currentDomain = 'Computer Vision'; continue; } // Adjusting these
    if (text === 'NATURAL LANGUAGE PROCESSING') { currentDomain = 'NLP'; continue; }
    if (text === 'CYBER SECURITY') { currentDomain = 'Cyber Security'; continue; }
    if (text === 'MIXED') { currentDomain = 'Mixed'; continue; }

    // Match "123 Title..."
    const match = text.match(/^\d+\s+(.*)$/);
    if (match) {
      let title = match[1].trim();
      let domain = currentDomain;
      
      // Auto-categorize mixed domain
      if (domain === 'Mixed') {
        const lower = title.toLowerCase();
        if (lower.includes('cyber') || lower.includes('security') || lower.includes('attack') || lower.includes('cloud')) domain = 'Cyber Security';
        else if (lower.includes('deep learning') || lower.includes('cnn') || lower.includes('neural network') || lower.includes('image')) domain = 'Deep Learning';
        else if (lower.includes('nlp') || lower.includes('text') || lower.includes('sentiment') || lower.includes('language')) domain = 'NLP';
        else domain = 'Machine Learning';
      }

      // Generate a dynamic short description
      const desc = `An advanced academic project exploring ${title.toLowerCase()} to solve real-world problems and optimize systems.`;
      
      // Assign random difficulty
      const diffs = ['Beginner', 'Intermediate', 'Advanced'];
      const difficulty = diffs[Math.floor(Math.random() * diffs.length)];

      projects.push({ title, domain, desc, difficulty });
    }
  }

  console.log(`Parsed ${projects.length} projects. Inserting...`);
  let count = 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of projects) {
      await client.query(
        'INSERT INTO project_catalog (title, domain, short_description, difficulty) VALUES ($1, $2, $3, $4)',
        [p.title, p.domain, p.desc, p.difficulty]
      );
      count++;
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error inserting projects:', e.message);
  } finally {
    client.release();
  }
  
  console.log(`Successfully inserted ${count} projects.`);
  process.exit(0);
}

run();
