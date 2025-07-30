import { Button } from "@mui/material";
import React from "react";

interface PaginationComponentProps {
  totalPages: number;
  page: number;
  onPageChange: (newPage: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  totalPages,
  page,
  onPageChange,
}) => {
  const windowSize = 5; // Number of page buttons to show around the current page
  const halfWindow = Math.floor(windowSize / 2);

  // Calculate the range of pages to display (current page ± 2 pages)
  let startPage = Math.max(0, page - halfWindow);
  let endPage = Math.min(totalPages - 1, page + halfWindow);

  // Adjust if we're near the start or the end of the range
  if (page - halfWindow < 0) {
    endPage = Math.min(
      totalPages - 1,
      endPage + (halfWindow - (page - halfWindow))
    );
  }
  if (page + halfWindow > totalPages - 1) {
    startPage = Math.max(0, startPage - (halfWindow - (totalPages - 1 - page)));
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button onClick={() => onPageChange(0)} disabled={page === 0}>
        Go to First
      </Button>
      <Button onClick={() => onPageChange(page - 1)} disabled={page === 0}>
        Previous
      </Button>
      {pages.map((pageNum) => (
        <Button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          variant={page === pageNum ? "contained" : "outlined"}
        >
          {pageNum + 1} {/* Displaying page numbers as 1-based */}
        </Button>
      ))}
      <Button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
      >
        Next
      </Button>
      <Button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={page === totalPages - 1}
      >
        Go to Last
      </Button>
    </div>
  );
};

export default PaginationComponent;
