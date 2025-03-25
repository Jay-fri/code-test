// File: src/App.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Types remain the same as in the original file
interface Video {
  id: number;
  title: string;
  photo: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  likes: number;
  username?: string;
}

interface PaginationResponse {
  error: boolean;
  list: Video[];
  page: number;
  limit: number;
  total: number;
  num_pages: number;
}

interface ColumnType {
  id: string;
  label: string;
  width: string;
  align?: string;
}

// Draggable Row Component
const DraggableRow: React.FC<{
  index: number;
  item: Video;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}> = ({ index, item, moveRow }) => {
  const [, ref] = useDrag({
    type: "ROW",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "ROW",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="flex items-center py-4 px-4 rounded-lg mb-3 border-[1px] border-white cursor-move"
    >
      <div className="w-10 text-gray-500">{index + 1}</div>
      <div className="flex-1 flex items-center">
        <div className="w-12 h-12 rounded overflow-hidden mr-4">
          <img
            src={item.photo}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[15px] font-[100] w-[300px] text-wrap text-white">
          {item.title}
        </span>
      </div>
      <div className="w-32 flex items-center">
        <span className="text-sm text-lime-500">{`user_${item.user_id}`}</span>
      </div>
      <div className="w-24 text-right flex items-center justify-end">
        <span className="text-white font-medium mr-1">{item.likes}</span>
      </div>
    </div>
  );
};

// Draggable Column Header Component
const DraggableColumnHeader: React.FC<{
  column: ColumnType;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
}> = ({ column, index, moveColumn }) => {
  const [, ref] = useDrag({
    type: "COLUMN",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "COLUMN",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveColumn(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className={`${column.width} ${column.align} cursor-move text-gray-500 text-sm`}
    >
      {column.label}
    </div>
  );
};

const App: React.FC = () => {
  // State Management
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default Columns
  const defaultColumns: ColumnType[] = [
    { id: "rank", label: "#", width: "w-10", align: "text-left" },
    { id: "title", label: "Title", width: "flex-1", align: "text-left" },
    { id: "author", label: "Author", width: "w-32", align: "text-left" },
    { id: "likes", label: "Likes", width: "w-24", align: "text-right" },
  ];

  const [columns, setColumns] = useState<ColumnType[]>(defaultColumns);

  // Fetch Videos
  const fetchVideos = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/v1/api/rest/video/PAGINATE",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            limit: 10,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data: PaginationResponse = await response.json();

      setVideos(data.list);
      setCurrentPage(data.page);
      setTotalPages(data.num_pages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  // Row Reordering
  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    setVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      const draggedVideo = newVideos[dragIndex];
      newVideos.splice(dragIndex, 1);
      newVideos.splice(hoverIndex, 0, draggedVideo);
      return newVideos;
    });
  }, []);

  // Column Reordering
  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const draggedColumn = newColumns[dragIndex];
      newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, draggedColumn);
      return newColumns;
    });
  }, []);

  // Pagination Handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchVideos(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchVideos(currentPage - 1);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl mb-6">Video Leaderboard</h1>

        {/* Columns Header */}
        <div className="flex mb-4 px-4 text-gray-500">
          {columns.map((column, index) => (
            <DraggableColumnHeader
              key={column.id}
              column={column}
              index={index}
              moveColumn={moveColumn}
            />
          ))}
        </div>

        {/* Loading and Error States */}
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {/* Video List */}
        {!isLoading && !error && (
          <>
            {videos.map((video, index) => (
              <DraggableRow
                key={video.id}
                index={index}
                item={video}
                moveRow={moveRow}
              />
            ))}

            {/* Pagination Controls */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </DndProvider>
  );
};

export default App;
