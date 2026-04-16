import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";
import { Button } from "@/components/ui/button";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

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

      const urls = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
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
      className="flex flex-col items-center justify-center rounded-xl cursor-pointer p-5 transition"
      style={{
        backgroundColor: P[50],
        border: `1px dashed ${P[300]}`,
      }}
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
                className="w-32 h-32 object-cover rounded"
                style={{
                  border: `1px solid ${P[200]}`,
                }}
              />
            ))}
          </div>

          <p style={{ color: P[500] }}>
            Click or drag photo to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-medium mb-2 mt-6" style={{ color: P[600] }}>
            Drag photo here
          </h3>

          <div className="flex flex-col items-center gap-4">
            <img
              src="/assets/icons/file.svg"
              width={96}
              height={77}
              alt="file-upload"
            />

            <p className="text-sm" style={{ color: P[400] }}>
              SVG, PNG, JPG
            </p>

            <Button
              className="shad-button_dark_4"
              style={{
                backgroundColor: P[500],
                color: "#fff",
              }}
            >
              Select From Computer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;