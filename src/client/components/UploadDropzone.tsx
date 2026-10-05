import { useRef, useState } from 'react';
import { api } from '../lib/api';
import { formatBytes } from '../lib/formatters';
import { MAX_UPLOAD_BYTES } from '../../shared/constants';

const stages = ['Uploading', 'Processing', 'Extracting', 'Analyzing', 'Building action plan', 'Completed'];

export function UploadDropzone({ onComplete }: { onComplete: (id: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const choose = async (candidate?: File) => {
    if (!candidate) return;
    if (candidate.size > MAX_UPLOAD_BYTES) {
      setError('This file is larger than 4.5 MB. Please upload a smaller document.');
      return;
    }
    setError('');
    setFile(candidate);
    setUploading(true);
    setStage(0);
    for (let index = 0; index < stages.length - 1; index += 1) {
      setStage(index);
      await new Promise((resolve) => setTimeout(resolve, index === 0 ? 350 : 420));
    }
    try {
      const result = await api.upload(candidate);
      setStage(stages.length - 1);
      await new Promise((resolve) => setTimeout(resolve, 450));
      onComplete(result.document.id);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'We could not process that file.');
      setUploading(false);
    }
  };
  return (
    <div className="upload-zone-wrap">
      <div
        className={`upload-zone ${dragging ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void choose(event.dataTransfer.files[0]);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter') inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          hidden
          onChange={(event) => void choose(event.target.files?.[0])}
        />
        {!uploading ? (
          <>
            <div className="upload-icon">
              <span>↑</span>
            </div>
            <h3>Drop a document here</h3>
            <p>or click to browse your files</p>
            <div className="upload-rules">
              <span>PDF</span>
              <span>PNG</span>
              <span>JPG</span>
              <span>Max 4.5 MB</span>
            </div>
          </>
        ) : (
          <>
            <div className="processing-ring" />
            <h3>{stages[stage]}…</h3>
            <p>
              {file?.name} · {file ? formatBytes(file.size) : ''}
            </p>
            <div className="processing-progress">
              <span style={{ width: `${((stage + 1) / stages.length) * 100}%` }} />
            </div>
          </>
        )}
      </div>
      {uploading && (
        <div className="stage-list">
          {stages.map((item, index) => (
            <div
              key={item}
              className={index < stage ? 'stage-item is-done' : index === stage ? 'stage-item is-current' : 'stage-item'}
            >
              <span>{index < stage ? '✓' : index === stage ? '•' : '○'}</span>
              {item}
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="upload-error">
          <span>!</span>
          <div>
            <strong>We couldn’t process that file.</strong>
            <p>{error}</p>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setError('');
              setFile(null);
              setUploading(false);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
