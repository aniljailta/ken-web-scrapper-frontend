import { Session } from "next-auth";
import { useState } from "react";

interface TableProps<T> {
  data: T[];
  headers: string[];
  columnValue: (params: {
    header: string;
    data: T;
    session?: Session;
  }) => React.ReactNode;
  session?: Session;
}

const DashboardTable = <T,>({
  data,
  headers,
  columnValue,
  session,
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(data.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="overflow-auto max-h-80">
      <table className="min-w-full bg-white ">
        <thead>
          <tr>
            {headers.map((i, index) => (
              <th className="py-2 px-4 text-left" key={index}>
                {i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="py-4 px-4 text-center text-gray-500"
              >
                No record found
              </td>
            </tr>
          ) : (
            currentRecords.map((item, index) => (
              <tr key={index} className="">
                {headers.map((header) => (
                  <td
                    key={`${index}-${header}`}
                    className="py-3 px-4 text-sm text-gray-900"
                  >
                    {columnValue({ header, data: item, session })}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DashboardTable;
