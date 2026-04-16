import { Button } from "./ui/button"
import { useState, useEffect } from "react"

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number | null;
  modified: string;
}

export function FileApp() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [cwd, setCwd] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/files?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
        setCwd(data.cwd);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles('');
  }, []);

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'directory') {
      setHistory(prev => [...prev, cwd]);
      const newPath = cwd ? `${cwd}/${item.name}` : item.name;
      fetchFiles(newPath);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevCwd = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      fetchFiles(prevCwd);
    }
  };

  const formatSize = (size: number | null) => {
    if (size === null) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Button onClick={handleBack} disabled={history.length === 0}>Back</Button>
        <span className="text-sm text-muted-foreground">/{cwd}</span>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        files.map((item) => (
          <div
            key={item.name}
            className={`flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm cursor-pointer hover:bg-accent ${item.type === 'directory' ? 'font-semibold' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <span>{item.type === 'directory' ? '📁' : '📄'} {item.name}</span>
            <span className="text-muted-foreground">{formatSize(item.size)}</span>
          </div>
        ))
      )}
    </div>
  )
}
