import React, { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Define types
interface Video {
  id: number;
  title: string;
  photo: string;
  user_id: number;
  icon: string;
  created_at: string;
  updated_at: string;
  likes: number;
  username?: string; // Adding username for display
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
  width: string; // Width classes for tailwind
  align?: string; // Alignment classes
}

// Draggable row component
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

  // Format the rank to have leading zero
  const formattedRank = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="flex items-center  py-4 px-4 rounded-lg mb-3 border-[1px] border-white cursor-move"
    >
      <div className="w-10 text-gray-500">{formattedRank}</div>
      <div className="flex-1 flex items-center">
        <div className="w-12 h-12 rounded overflow-hidden mr-4">
          <img
            src={item.photo || `${item.photo}`}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `${item.photo}`;
            }}
          />
        </div>
        <span className="text-[15px] font-[100] w-[300px] text-wrap text-white">
          {item.title}
        </span>
      </div>
      <div className="w-32 flex items-center">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 mr-2">
          <img
            src={`${item.icon}`}
            alt={`User ${item.user_id}`}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm text-lime-500">
          {item.username || `user_${item.user_id}`}
        </span>
      </div>
      <div className="w-24 text-right flex items-center justify-end">
        <span className="text-white font-medium mr-1">{item.likes}</span>
        <img src="/Icons.svg" alt="" />
      </div>
    </div>
  );
};

// Draggable column header
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
      {column.id === "likes" ? (
        <div className="flex items-center justify-end">
          {column.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      ) : (
        column.label
      )}
    </div>
  );
};

const App: React.FC = () => {
  // State for videos and pagination
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use refs to prevent infinite loops
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadRef = useRef(true);

  // Define default columns
  const defaultColumns: ColumnType[] = [
    { id: "rank", label: "#", width: "w-10", align: "text-left" },
    { id: "title", label: "Title", width: "flex-1", align: "text-left" },
    { id: "author", label: "Author", width: "w-32", align: "text-left" },
    { id: "likes", label: "Most Liked", width: "w-24", align: "text-right" },
  ];

  // State for columns (for drag and drop)
  const [columns, setColumns] = useState<ColumnType[]>(defaultColumns);

  // Sample fallback data in case API fails
  const fallbackData: Video[] = [
    {
      id: 1,
      title: "Rune raises $100,000 for marketing through NFT butterflies sale",
      photo: "/one.svg",
      user_id: 1,
      icon: "/onee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 254,
      username: "ninjsnft",
    },
    {
      id: 2,
      title: "The Cryptocurrency Trading Bible",
      photo: "/two.svg",
      user_id: 2,
      icon: "/twoo.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 203,
      username: "deniscrypto",
    },
    {
      id: 3,
      title: "Designing our new company brand: Meta",
      photo: "/three.svg",
      user_id: 3,
      icon: "/threee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 134,
      username: "meta_world98",
    },
    {
      id: 4,
      title: "Connect media partners, earn exciting rewards for today",
      photo: "/four.svg",
      user_id: 4,
      icon: "/fourr.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 99,
      username: "kingdom43world",
    },
    {
      id: 5,
      title: "Designing a more effective projects",
      photo: "/five.svg",
      user_id: 5,
      icon: "/fivee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 88,
      username: "sjx1987423kjbdfsf",
    },
    // Adding more fallback data for additional pages
    {
      id: 6,
      title: "Introduction to Web3 Development",
      photo: "https://picsum.photos/id/6/200/200",
      user_id: 6,
      icon: "/onee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 78,
      username: "web3dev",
    },
    {
      id: 7,
      title: "Understanding NFT Marketplaces",
      photo: "https://picsum.photos/id/7/200/200",
      user_id: 7,
      icon: "/twoo.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 76,
      username: "nft_expert",
    },
    {
      id: 8,
      title: "The Future of Decentralized Finance",
      photo: "https://picsum.photos/id/8/200/200",
      user_id: 8,
      icon: "/threee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 74,
      username: "defi_master",
    },
    {
      id: 9,
      title: "Blockchain Security Best Practices",
      photo: "https://picsum.photos/id/9/200/200",
      user_id: 9,
      icon: "/fourr.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 71,
      username: "security_pro",
    },
    {
      id: 10,
      title: "Smart Contract Development for Beginners",
      photo: "https://picsum.photos/id/10/200/200",
      user_id: 10,
      icon: "/fivee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 68,
      username: "smart_dev",
    },
    // More data for third page
    {
      id: 11,
      title: "Crypto Market Analysis: Q1 2025",
      photo: "https://picsum.photos/id/11/200/200",
      user_id: 11,
      icon: "/onee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 65,
      username: "crypto_analyst",
    },
    {
      id: 12,
      title: "Web3 User Experience Design",
      photo: "https://picsum.photos/id/12/200/200",
      user_id: 12,
      icon: "/twoo.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 62,
      username: "ux_designer",
    },
    {
      id: 13,
      title: "Tokenomics Explained",
      photo: "https://picsum.photos/id/13/200/200",
      user_id: 13,
      icon: "/threee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 58,
      username: "token_expert",
    },
    {
      id: 14,
      title: "Building a Community-Driven DAO",
      photo: "https://picsum.photos/id/14/200/200",
      user_id: 14,
      icon: "/fourr.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 55,
      username: "dao_builder",
    },
    {
      id: 15,
      title: "NFT Art Creation Workshop",
      photo: "https://picsum.photos/id/15/200/200",
      user_id: 15,
      icon: "/fivee.svg",
      created_at: "2024-12-09T09:40:08.000Z",
      updated_at: "2024-12-09T09:40:08.000Z",
      likes: 51,
      username: "nft_artist",
    },
  ];

  // Function to generate paginated data from fallback
  const generateFallbackPageData = (page: number, itemsPerPage: number = 5) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Make sure we don't go out of bounds
    if (startIndex >= fallbackData.length) {
      return [];
    }

    return fallbackData.slice(
      startIndex,
      Math.min(endIndex, fallbackData.length)
    );
  };

  // Calculate total pages for fallback data
  const calculateFallbackTotalPages = (itemsPerPage: number = 5) => {
    return Math.ceil(fallbackData.length / itemsPerPage);
  };

  // Fetch videos data - now with better fallback handling
  const fetchVideos = useCallback(async (page: number) => {
    console.log(`Fetching videos for page ${page}`);

    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // For quick testing - use this to force fallback mode
    const useFallbackMode = true;

    try {
      // Set a timeout
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 5000); // Reduced timeout to 5s for faster fallback

      if (useFallbackMode) {
        // Simulate API failure but with proper pagination
        throw new Error("API unavailable");
      }

      const response = await fetch(
        "http://localhost:3000/v1/api/rest/video/PAGINATE",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            limit: 5, // Show 5 per page as implemented in fallback
          }),
          signal,
        }
      );

      clearTimeout(timeoutId);

      if (!isMounted.current) return;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaginationResponse = await response.json();

      if (!data.error) {
        // Add username placeholder if not present in the API response
        const videosWithUsername = data.list.map((video) => ({
          ...video,
          username: video.username || `user_${video.user_id}`,
        }));

        setVideos(videosWithUsername);
        setCurrentPage(data.page);
        setTotalPages(data.num_pages);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error("API returned an error");
      }
    } catch (error) {
      if (!isMounted.current) return;

      const err = error as Error;
      console.error("Failed to fetch videos:", err);

      // Use fallback data with proper pagination
      console.log(`Using fallback data for page ${page}`);

      // Get properly paginated fallback data
      const paginatedData = generateFallbackPageData(page);
      const fallbackTotalPages = calculateFallbackTotalPages();

      console.log(`Fallback data for page ${page}:`, paginatedData);
      console.log(`Fallback total pages: ${fallbackTotalPages}`);

      setVideos(paginatedData);
      setCurrentPage(page);
      setTotalPages(fallbackTotalPages);
      setError("Using offline data. Connection to API failed.");
      initialLoadRef.current = false;
    } finally {
      if (isMounted.current) {
        console.log(
          `Finished loading, isLoading set to false, current page: ${currentPage}, total pages: ${totalPages}`
        );
        setIsLoading(false);
      }
    }
  }, []);

  // Handle retries separately from the fetch function
  useEffect(() => {
    if (error && retryCount > 0 && retryCount < 2) {
      const retryTimer = setTimeout(() => {
        if (isMounted.current) {
          fetchVideos(currentPage);
        }
      }, 1500);

      return () => clearTimeout(retryTimer);
    }
  }, [error, retryCount, currentPage, fetchVideos]);

  // Initial fetch - with cleanup to prevent memory leaks and double fetching
  useEffect(() => {
    isMounted.current = true;
    initialLoadRef.current = true;
    fetchVideos(1);

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchVideos]);

  // Handle row reordering with proper memoization
  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    setVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      const draggedVideo = newVideos[dragIndex];
      newVideos.splice(dragIndex, 1);
      newVideos.splice(hoverIndex, 0, draggedVideo);
      return newVideos;
    });
  }, []);

  // Handle column reordering with proper memoization
  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const draggedColumn = newColumns[dragIndex];
      newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, draggedColumn);
      return newColumns;
    });
  }, []);

  // Handle pagination - now with better dependency handling and debugging
  const handleNextPage = useCallback(() => {
    console.log("Next button clicked");
    console.log(
      `Current page: ${currentPage}, Total pages: ${totalPages}, isLoading: ${isLoading}`
    );

    if (currentPage < totalPages && !isLoading) {
      console.log(`Proceeding to page ${currentPage + 1}`);
      fetchVideos(currentPage + 1);
    } else {
      console.log(
        "Cannot proceed to next page - either on last page or loading"
      );
    }
  }, [currentPage, totalPages, fetchVideos, isLoading]);

  const handlePrevPage = useCallback(() => {
    console.log("Previous button clicked");
    console.log(`Current page: ${currentPage}, isLoading: ${isLoading}`);

    if (currentPage > 1 && !isLoading) {
      console.log(`Going back to page ${currentPage - 1}`);
      fetchVideos(currentPage - 1);
    } else {
      console.log(
        "Cannot go to previous page - either on first page or loading"
      );
    }
  }, [currentPage, fetchVideos, isLoading]);

  // Manual retry function - simplified
  const handleRetry = useCallback(() => {
    console.log("Retry button clicked");
    setRetryCount(0);
    fetchVideos(currentPage);
  }, [currentPage, fetchVideos]);

  // Get current date and time for the header
  const formattedDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="flex justify-between items-center p-8">
          <h1 className="text-3xl font-bold">APP</h1>
          <button className="bg-lime-400 hover:bg-lime-500 text-black rounded-full px-6 py-2 font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="px-8 pb-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-light">Today's leaderboard</h2>
            <div className="flex items-center bg-gray-900 rounded-lg overflow-hidden">
              <span className="px-4 py-2 text-gray-400">{formattedDate}</span>
              <span className="bg-lime-400 text-black px-4 py-2 font-medium">
                SUBMISSIONS OPEN
              </span>
              <span className="px-4 py-2 text-gray-400">{currentTime}</span>
            </div>
          </div>

          {/* Table Header - Draggable */}
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

          {/* Debug Info - Remove in production */}
          <div className="bg-gray-900 text-xs text-gray-400 p-2 rounded-lg mb-4">
            Debug: Page {currentPage} of {totalPages} | Items: {videos.length} |
            Loading: {isLoading ? "Yes" : "No"} | Error: {error || "None"}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gray-900 text-white p-4 rounded-lg mb-4 flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={handleRetry}
                className="bg-lime-400 hover:bg-lime-500 text-black rounded px-3 py-1 text-sm font-medium ml-4"
              >
                Retry
              </button>
            </div>
          )}

          {/* Leaderboard Items - Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-400"></div>
            </div>
          ) : (
            <>
              {/* Leaderboard Items - Draggable Rows */}
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <DraggableRow
                    key={video.id}
                    index={index}
                    item={video}
                    moveRow={moveRow}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No videos found
                </div>
              )}

              {/* Pagination Controls*/}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || isLoading}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage <= 1 || isLoading
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous
                </button>

                <div className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages || isLoading}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage >= totalPages || isLoading
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </DndProvider>
  );
};

export default App;
