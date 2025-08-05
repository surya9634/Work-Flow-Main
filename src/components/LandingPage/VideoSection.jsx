import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const VideoSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  return (
    <div className="overflow-hidden">
      <motion.section
        ref={sectionRef}
        initial={{ y: 200, opacity: 0, rotateX: 60 }}
        animate={isInView ? { y: 0, opacity: 1, rotateX: 0 } : {}}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="h-screen bg-black flex items-center justify-center"
      >
        <div className="w-[60%] aspect-video max-w-4xl border border-white rounded-xl overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.5)] transition duration-500">
          <video
            src="/Work-flow.mp4"
            className="w-full h-full object-cover"
            poster='/Work-flow.jpg'
            controls
          />
        </div>
      </motion.section>
    </div>
  );
};

export default VideoSection;
