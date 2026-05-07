import { Button } from "./ui/button"
import { useState, useEffect } from "react"
import { LuChevronLeft, LuChevronRight, LuHouse, LuFile } from "react-icons/lu"
import { openFile } from "@/lib/openFile"
import api from "@/lib/api"
import { ACCENT_COLORS, useSettingsStore } from "@/store/settings"

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number | null;
  modified: string;
}

export function FileApp({ initialPath }: { initialPath?: string }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [cwd, setCwd] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const accentIndex = useSettingsStore(s => s.accentIndex)
  const systemColor = ACCENT_COLORS[accentIndex].color

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
    fetchFiles(initialPath || '');
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
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={history.length === 0}
            className="h-8 w-8 p-0 border-r-0 rounded-r-none"
          >
            <LuChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForward}
            disabled={future.length === 0}
            className="h-8 w-8 p-0 border-l-0 rounded-l-none"
          >
            <LuChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
      <div className="flex-1 overflow-auto p-4 content-start">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-start">
            {files
              .filter((f) => !f.name.startsWith('.'))
              .sort((a, b) => {
                if (a.type === 'directory' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
              })
              .map((item) => (
                <div
                  key={item.name}
                  className="group flex flex-col items-center p-2 rounded-lg w-[88px] hover:bg-primary/10 cursor-pointer transition-colors duration-150 relative"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="mb-1.5 w-12 h-12 flex items-center justify-center pointer-events-none">
                    {item.type === 'directory' ? (
                      <img src={`/icons/dir-${systemColor}.svg`} alt="directory" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <LuFile className="h-10 w-10 text-foreground/50 group-hover:text-foreground/70 group-hover:scale-105 transition-all" />
                    )}
                  </div>
                  <div className="text-center w-full pointer-events-none">
                    <div className="text-[11px] leading-tight font-medium text-foreground line-clamp-2 break-all" title={item.name}>
                      {item.name}
                    </div>
                    {item.type === 'file' && item.size !== null && (
                      <div className="text-[9px] text-muted-foreground mt-0.5">
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
