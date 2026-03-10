import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";
import { Button } from "@/components/ui/button";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl?: string[];
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>(mediaUrl || []);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFiles(acceptedFiles);
      fieldChange(acceptedFiles);
      const urls=acceptedFiles.map((file)=>URL.createObjectURL(file));
      setFileUrls(urls);
        
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".svg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center justify-center bg-dark-3 rounded-xl cursor-pointer p-5"
    >
      <input {...getInputProps()} />

      {fileUrls.length > 0 ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            {fileUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`preview-${idx}`}
                className="file-uploader-img w-32 h-32 object-cover rounded"
              />
            ))}
          </div>
    
          <p className="file-uploader-label">Click or drag photo to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photo here
          </h3>
          <div className="file-uploader-box flex flex-col items-center gap-4">
            <img
              src="/assets/icons/file.svg"
              width={96}
              height={77}
              alt="file-upload"
            />
            <p className="text-light-4 small-regular mb-6">
              SVG, PNG, JPG
            </p>
            <Button className="shad-button_dark_4">Select From Computer</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;