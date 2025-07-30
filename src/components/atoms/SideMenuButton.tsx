import React, { useState } from "react";
import { ListItem, Collapse, Box } from "@mui/material";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import Link from "next/link";
import { SideMenuButtonProps } from "../../types";
import { FaChevronRight } from "react-icons/fa6";

const SideMenuButton = (props: SideMenuButtonProps) => {
  const {
    icon,
    title,
    items = [],
    isOpen,
    onToggle,
    closeToggle,
    path,
    pathname = "",
    isActive,
  } = props;

  const [subOpen, setSubOpen] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setSubOpen(subOpen === id ? null : id);
  };

  return (
    <>
      <ListItem
        className={`sidebar-menu ${isActive ? "active" : ""}`}
        onClick={onToggle}
        sx={{
          // py: 1.2,
          zIndex: 1,
          transition: "all 0.3s ease",
          "& svg": {
            fontSize: 24,
          },
        }}
      >
        {icon}
        {path ? (
          <Link
            href={path}
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={closeToggle}
          >
            {title}
          </Link>
        ) : (
          title
        )}
        {(items?.length ?? 0) > 0 && (
          <>
            {isOpen ? (
              <MdExpandLess size={20} style={{ marginLeft: "auto" }} />
            ) : (
              <FaChevronRight size={13} style={{ marginLeft: "auto" }} />
            )}
          </>
        )}
      </ListItem>
      {items?.length > 0 && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          {items.map((item: any) => (
            <React.Fragment key={item.id}>
              <Link href={item.menuUrl ?? ""} className="curved-bullets">
                <ListItem
                  className={
                    item.menuUrl && pathname.startsWith(item.menuUrl)
                      ? "submenu-item active-submenu sidebar-section-bullets"
                      : "submenu-item sidebar-section-bullets"
                  }
                  sx={{
                    pb: 1.3,
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleToggle(item.id)}
                >
                  <span onClick={closeToggle}>{item.menuName}</span>
                  {(item.childMenus?.length ?? 0) > 0 && (
                    <>
                      {subOpen === item.id ? (
                        <MdExpandLess
                          size={22}
                          style={{ marginLeft: "auto" }}
                        />
                      ) : (
                        <FaChevronRight
                          size={13}
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </>
                  )}
                </ListItem>
              </Link>
              <Collapse in={subOpen === item.id} timeout="auto" unmountOnExit>
                {item.childMenus?.map((list: any, index: any) => (
                  <ListItem
                    key={index}
                    className={
                      pathname.startsWith(list.menuUrl)
                        ? "submenu-item active-submenu sidebar-sub-section-bullets"
                        : "submenu-item sidebar-sub-section-bullets"
                    }
                    sx={{
                      pb: 1.3,
                      fontSize: 17,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Link
                      href={list.menuUrl ?? ""}
                      className="curved-sub-bullets"
                      onClick={closeToggle}
                    >
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        gap={1}
                        pl={2}
                      >
                        {list?.menuName}
                      </Box>
                    </Link>
                  </ListItem>
                ))}
              </Collapse>
            </React.Fragment>
          ))}
        </Collapse>
      )}
    </>
  );
};

export default SideMenuButton;
