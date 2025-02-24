import React, { useState } from "react";
import { Page, Text, View, Document, pdf } from "@react-pdf/renderer";
import httpService from "@/utils/httpService";
import { Conversation } from "@/app/types";
import { formatDate } from "@/utils/tableComponents";
import { Session } from "next-auth";
import Image from "next/image";
import { styles } from "./constant";

const DocumentComponent = ({ tableData }: { tableData: Conversation[] }) => {
  const formatProductName = (name: string) => {
    // Split by comma and join with newline
    return name.split(",").join("\n");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>List</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableCellHeader}>
              <Text style={styles.cellText}>Products Name</Text>
            </View>
            <View style={styles.tableCellHeader}>
              <Text style={styles.cellText}>User Name</Text>
            </View>
            <View style={styles.tableCellHeader}>
              <Text style={styles.cellText}>User Email</Text>
            </View>
            <View style={styles.tableCellHeader}>
              <Text style={styles.cellText}>Created</Text>
            </View>
            <View style={styles.tableCellHeader}>
              <Text style={styles.cellText}>Messages</Text>
            </View>
          </View>

          {/* Table Rows */}
          {tableData.length > 0 ? (
            tableData.map((row) => (
              <View style={styles.tableRow} key={row.id}>
                <View style={styles.productNameCell}>
                  <Text style={styles.productNameText}>
                    {formatProductName(row.productName as string)}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.cellText}>
                    {row.user?.name || "Guest"}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.cellText}>{row.user?.email || ""}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.cellText}>
                    {formatDate(row.createdAt)}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.cellText}>{row.messages.length}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableCell}>
              <Text style={styles.cellText}>No data found</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

// ✅ Define the PDF Document component
const ProductTableDoc = ({
  productName,
  session,
}: {
  productName: string;
  session?: Session;
}) => {
  const [fetching, setFetching] = useState(false);

  const handleDownload = async () => {
    if (!session?.user?.access_token) return;

    setFetching(true);

    try {
      // ✅ Fetch user reports
      const response = await httpService.get(
        `users/conversation-by-product-name?productName=${productName}`,
        {
          headers: { Authorization: `Bearer ${session.user.access_token}` },
        }
      );

      const { data } = await response.data;

      // ✅ Generate PDF Blob
      const doc = <DocumentComponent tableData={data} />;
      const blob = await pdf(doc).toBlob();

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const fileName = `${productName}_query_${timestamp}.pdf`;
      // ✅ Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // ✅ Clean up URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setFetching(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 rounded-sm bg-white cursor-pointer hover:bg-gray-200"
      disabled={fetching}
    >
      {fetching ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
      ) : (
        <Image src="/images/download.png" alt="arrow" width={18} height={18} />
      )}
    </button>
  );
};

// ✅ Ensure the component is correctly exported
export default ProductTableDoc;
