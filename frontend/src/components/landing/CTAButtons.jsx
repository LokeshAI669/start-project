import React from 'react';
import { motion } from 'motion/react';

export default function CTAButtons({ navigate }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
      }}
      className="hero-ctas"
    >
      <motion.button 
        onClick={() => navigate('/request')} 
        className="btn btn-primary btn-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Submit Request →
      </motion.button>
      
      <motion.button 
        onClick={() => {
          const cat = document.getElementById('catalog');
          if (cat) cat.scrollIntoView({ behavior: 'smooth' });
        }} 
        className="btn btn-secondary btn-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Browse Projects
      </motion.button>
    </motion.div>
  );
}
