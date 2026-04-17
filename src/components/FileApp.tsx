import { Button } from "./ui/button"
import { useState, useEffect } from "react"
import { LuChevronLeft, LuChevronRight, LuHouse, LuFolder, LuFile } from "react-icons/lu"
import { openFile } from "@/lib/openFile"
import api from "@/lib/api"

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
  const [future, setFuture] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/files', { params: { path } });
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
      setFuture([]);
      const newPath = cwd ? `${cwd}/${item.name}` : item.name;
      fetchFiles(newPath);
    } else {
      const filePath = cwd ? `${cwd}/${item.name}` : item.name;
      openFile(filePath);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevCwd = history[history.length - 1];
      setFuture(prev => [cwd, ...prev]);
      setHistory(prev => prev.slice(0, -1));
      fetchFiles(prevCwd);
    }
  };

  const handleForward = () => {
    if (future.length > 0) {
      const nextCwd = future[0];
      setHistory(prev => [...prev, cwd]);
      setFuture(prev => prev.slice(1));
      fetchFiles(nextCwd);
    }
  };

  const handleHome = () => {
    if (cwd !== '') {
      setHistory(prev => [...prev, cwd]);
      setFuture([]);
      fetchFiles('');
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    if (path !== cwd) {
      setHistory(prev => [...prev, cwd]);
      setFuture([]);
      fetchFiles(path);
    }
  };

  const formatSize = (size: number | null) => {
    if (size === null) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getBreadcrumbs = () => {
    if (!cwd) return [{ name: 'Home', path: '' }];
    const parts = cwd.split('/');
    const breadcrumbs = [{ name: 'Home', path: '' }];
    let currentPath = '';
    parts.forEach((part) => {
      currentPath += (currentPath ? '/' : '') + part;
      breadcrumbs.push({ name: part, path: currentPath });
    });
    return breadcrumbs;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Navigation Bar - Fixed at top */}
      <div className="flex items-center gap-2 p-4 border-b bg-card/50 backdrop-blur-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          disabled={history.length === 0}
          className="h-8 w-8 p-0"
        >
          <LuChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForward}
          disabled={future.length === 0}
          className="h-8 w-8 p-0"
        >
          <LuChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleHome}
          disabled={cwd === ''}
          className="h-8 w-8 p-0"
        >
          <LuHouse className="h-4 w-4" />
        </Button>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 ml-4 text-sm">
          {getBreadcrumbs().map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && <span className="text-muted-foreground mx-1">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(crumb.path)}
                className="hover:text-primary transition-colors px-2 py-1 rounded hover:bg-accent"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* File Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {files.map((item) => (
              <div
                key={item.name}
                className="group flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => handleItemClick(item)}
              >
                <div className="mb-2">
                  {item.type === 'directory' ? (
                    <LuFolder className="h-12 w-12 text-blue-500 group-hover:text-blue-600" />
                  ) : (
                    <LuFile className="h-12 w-12 text-gray-500 group-hover:text-gray-600" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium truncate w-full max-w-30" title={item.name}>
                    {item.name}
                  </div>
                  {item.type === 'file' && item.size !== null && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatSize(item.size)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
