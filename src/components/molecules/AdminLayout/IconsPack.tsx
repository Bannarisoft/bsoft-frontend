import { AiOutlineSchedule, AiOutlineThunderbolt } from "react-icons/ai";
import { FaQuestionCircle } from "react-icons/fa";
import { GoDatabase } from "react-icons/go";
import { HiOutlineChartBarSquare } from "react-icons/hi2";
import { IoCalendarOutline } from "react-icons/io5";
import { MdOutlineDashboard } from "react-icons/md";
import { PiChartPieSliceLight } from "react-icons/pi";
import { RiExchangeLine } from "react-icons/ri";
import { SlSettings } from "react-icons/sl";
import { VscCodeOss } from "react-icons/vsc";

export const getIconByMenuItem = (menuItem: any) => {
  const menuNameLower = menuItem.menuName?.toLowerCase() || "";
  if (menuNameLower.includes("settings")) return <SlSettings size={18} />;
  if (menuNameLower.includes("depreciation"))
    return <HiOutlineChartBarSquare size={20} />;
  if (menuNameLower.includes("transfer")) return <RiExchangeLine size={18} />;
  if (menuNameLower.includes("report"))
    return <PiChartPieSliceLight size={18} />;
  if (menuNameLower.includes("request")) return <AiOutlineSchedule size={18} />;
  if (menuNameLower.includes("schedule"))
    return <IoCalendarOutline size={18} />;
  if (menuNameLower.includes("master")) return <GoDatabase size={18} />;
  if (menuNameLower.includes("management")) return <VscCodeOss size={18} />;
  if (menuNameLower.includes("dashboard")) return <MdOutlineDashboard size={18} />;
  if (menuNameLower.includes("power"))
    return <AiOutlineThunderbolt size={18} />;
  return <FaQuestionCircle size={18} />;
};
