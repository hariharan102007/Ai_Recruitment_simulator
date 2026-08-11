import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FileUpload = ({ onDrop, accept = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, maxSize = 5242880, file, className = '' }) => {
  const onDropCb = useCallback((acceptedFiles) => { if (onDrop) onDrop(acceptedFiles[0]); }, [onDrop]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onDropCb, accept, maxSize, maxFiles: 1 });

  return (
    <div className={className}>
      <div {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/5'}`}>
        <input {...getInputProps()} />
        <motion.div animate={{ y: isDragActive ? -5 : 0 }} className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            {file ? <FiFile className="w-8 h-8 text-indigo-400" /> : <FiUploadCloud className="w-8 h-8 text-indigo-400" />}
          </div>
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium">{isDragActive ? 'Drop your file here' : 'Drag & drop your resume here'}</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse (PDF, DOCX - max 5MB)</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FileUpload;
