import React from "react";

const CustomTable = ({
  data,
  columns,
  emptyMessage,
  onSort,
  onRowClick,
  actions,
  currentPage,
  usersPerPage,
}) => {
  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border p-2">
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="btn btn-ghost"
                  >
                    {column.label}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {actions?.length > 0 && <th className="border p-2">Действия</th>}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => {
              return (
                <tr
                  key={row._id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="cursor-pointer hover:bg-base-100 border"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="border p-2">
                      {column.render
                        ? column.render(
                            row[column.key],
                            row,
                            index,
                            { currentPage, usersPerPage }
                          )
                        : row[column.key] || "Н/Д"}
                    </td>
                  ))}
                  {actions?.length > 0 && (
                    <td className="border p-2">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          className={`btn ${action.className}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                        >
                          {action.icon} {action.label}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions?.length > 0 ? 1 : 0)}
                className="text-center border p-2"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;