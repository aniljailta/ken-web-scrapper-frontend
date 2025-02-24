import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    alignItems: "stretch",
    minHeight: 35,
    flexWrap: "nowrap",
  },
  tableCellHeader: {
    width: "25%",
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 8,
    backgroundColor: "#eee",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    width: "25%",
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 8,
    textAlign: "left",
  },
  productNameCell: {
    width: "25%",
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 8,
    textAlign: "left",
  },
  cellText: {
    fontSize: 10,
    lineHeight: 1.2,
  },
  productNameText: {
    fontSize: 10,
    lineHeight: 1.4, // Increased line height for better readability
  },
});
