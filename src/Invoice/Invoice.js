import "./Invoice.css";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import { FaCloudDownloadAlt } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import {
  FaIndianRupeeSign,
  FaCirclePlus,
  FaCircleXmark,
} from "react-icons/fa6";
import jsPDF from "jspdf";

function Invoice() {
  const [userName, setuserName] = useState("");
  const [Address, setAddress] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [invoiceid, setinvoiceid] = useState("");
  const [invoicedate, setinvoicedate] = useState("");
  const [note, setnote] = useState("");
  const [billto, setbillto] = useState("");
  const [billtoaddress, setbilltoadddress] = useState("");
  const [taxes, setTaxes] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [charges, setCharges] = useState(0);
  const [allValue, setAllValue] = useState(0);
  const [dueDate, setduedate] = useState("");

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e, id, field) => {
    const newValue = e.target.value;
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        return { ...row, [field]: newValue };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const generatePDF = () => {
    var doc = new jsPDF();

    const purple = [66, 1, 250];
    // const customPurple = [45, 0, 173];

    doc.setTextColor(purple[0], purple[1], purple[2]);
    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, null, null, "center");

    doc.setTextColor(0);

    if (imageSrc.startsWith("data:image")) {
      const imageWidth = 35;
      const imageHeight = 35;
      const imageX = 10;
      const imageY = 45;
      doc.addImage(imageSrc, "JPEG", imageX, imageY, imageWidth, imageHeight);
    }

    const pageWidth = doc.internal.pageSize.width;
    const marginRight = 10;
    const marginLeft = 10;

    doc.setFontSize(10);
    let detailsStartY = 50;
    const billFrom = `Bill From: ${userName}`;
    const address = `Address: ${Address}`;
    const invoiceID = `Invoice ID: ${invoiceid}`;
    const invoiceDateText = `Invoice Date: ${invoicedate}`;

    const billFromDetails = [billFrom, address, invoiceID, invoiceDateText];
    billFromDetails.forEach((text, index) => {
      doc.text(
        text,
        pageWidth - marginRight - doc.getTextWidth(text),
        detailsStartY + 10 * index
      );
    });

    let billToDetailsStartY = detailsStartY + 10 * billFromDetails.length + 15;
    doc.setFontSize(11);

    const billTo = `Bill To: ${billto}`;
    const billToAddress = `Address: ${billtoaddress}`;
    doc.text(billTo, marginLeft, billToDetailsStartY);
    doc.text(billToAddress, marginLeft, billToDetailsStartY + 10);

    const dueDateText = `Due Date: ${dueDate}`;
    doc.text(
      dueDateText,
      pageWidth - marginRight - doc.getTextWidth(dueDateText),
      billToDetailsStartY
    );

    let tableStartY = billToDetailsStartY + 20 + 15;
    doc.setTextColor(purple[0], purple[1], purple[2]);
    const tableHeaders = [
      "Item Name",
      "Description",
      "Quantity",
      "Rate",
      "Total",
    ];
    const headerPositions = [10, 60, 100, 140, 180];

    tableHeaders.forEach((header, index) => {
      doc.text(header, headerPositions[index], tableStartY);
    });

    doc.setTextColor(0);
    rows.forEach((row, index) => {
      tableStartY += 10;
      doc.text(row.itemName, headerPositions[0], tableStartY);
      doc.text(row.description, headerPositions[1], tableStartY);
      doc.text(row.quantity.toString(), headerPositions[2], tableStartY);
      doc.text(row.rate.toString(), headerPositions[3], tableStartY);
      doc.text(row.total.toString(), headerPositions[4], tableStartY);
    });

    let noteStartY = tableStartY + 20 + 15;
    doc.text("Note:", marginLeft, noteStartY);
    doc.text(note, marginLeft, noteStartY + 10);

    let financialDetailsStartY = noteStartY + 20 + 15;
    const financialDetails = [
      `Sub Total: ${grandTotal.toFixed(2)}`,
      `Tax: ${taxes}%`,
      `Discount: ${discount}%`,
      `Other Charges: ${charges}`,
      `Total: ${allValue.toFixed(2)}`,
    ];

    financialDetails.forEach((detail, index) => {
      doc.text(
        detail,
        pageWidth - marginRight - doc.getTextWidth(detail),
        financialDetailsStartY + 10 * index
      );
    });

    const borderColor = [66, 1, 250];
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.02);
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 5;
    const x = margin;
    const y = margin;
    const width = pageWidth - margin * 2;
    const height = pageHeight - margin * 2;
    doc.rect(x, y, width, height);

    doc.save("invoice.pdf");
  };

  const [rows, setRows] = useState([
    {
      id: Date.now(),
      itemName: "",
      description: "",
      quantity: 1,
      rate: 0,
      tax: 0,
      total: 0,
    },
  ]);

  const handleQuantityChange = (e, id) => {
    const newQuantity = parseFloat(e.target.value) || 0;
    updateRow(id, newQuantity, null);
  };

  const handleRateChange = (e, id) => {
    const newRate = parseFloat(e.target.value) || 0;
    updateRow(id, null, newRate);
  };

  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    const total = rows.reduce((acc, curr) => acc + curr.total, 0);
    setGrandTotal(total);
  }, [rows]);

  const updateRow = (id, newQuantity, newRate) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        const quantity = newQuantity !== null ? newQuantity : row.quantity;
        const rate = newRate !== null ? newRate : row.rate;
        const total = quantity * rate;
        return { ...row, quantity, rate, total };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      itemName: "",
      description: "",
      quantity: 1,
      rate: 0,
      tax: 0,
      total: 0,
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (idToRemove) => {
    setRows(rows.filter((row) => row.id !== idToRemove));
  };

  function Alltotal() {
    const taxRate = Number(taxes);
    const discountRate = Number(discount);
    const additionalCharges = Number(charges);

    const totalAfterDiscount = grandTotal - (grandTotal * discountRate) / 100;
    const totalAfterTax =
      totalAfterDiscount + (totalAfterDiscount * taxRate) / 100;
    const finalTotal = totalAfterTax + additionalCharges;

    setAllValue(finalTotal);
  }

  return (
    <div className="invoice">
      {/* Nav Bar */}

      <div className="navbar">
        <h1>Invoice</h1>
        <button onClick={generatePDF}>
          Download
          <IoMdArrowDropdownCircle
            style={{ color: "#247D5D", fontSize: "17px" }}
          />
        </button>
      </div>

      {/* Main Content */}

      <div className="main">
        <section>
          <div className="section-1">
            <input
              type="text"
              placeholder="Bill From : (Your Name)"
              onChange={(e) => setuserName(e.target.value)}
            />
            <textarea
              placeholder="Type your address here"
              onChange={(e) => setAddress(e.target.value)}
            ></textarea>
          </div>
          <div className="section-2">
            <input
              type="text"
              placeholder="Bill To : (Recipient name)"
              onChange={(e) => setbillto(e.target.value)}
            />
            <textarea
              placeholder="Type Recipents address here"
              onChange={(e) => setbilltoadddress(e.target.value)}
            ></textarea>
          </div>
        </section>
        <section className="two">
          <div className="section-1" style={{ gap: "18px", border: "none" }}>
            <input
              type="text"
              placeholder="Invoice Id :"
              onChange={(e) => setinvoiceid(e.target.value)}
            />
            <input
              type="text"
              placeholder="Incoice Date :"
              onChange={(e) => setinvoicedate(e.target.value)}
            />
          </div>
          <div className="section-2" style={{ gap: "18px", border: "none" }}>
            <input type="text" placeholder="Status : (ex. paid or pending)" />
            <input
              type="text"
              placeholder="Due Date :"
              onChange={(e) => setduedate(e.target.value)}
            />
          </div>
        </section>
        <section className="three">
          <label className="upload-img" htmlFor="file">
            {imageSrc && <img src={imageSrc} alt="" />}
            <FaCloudDownloadAlt style={{ fontSize: "22px" }} />
            <p>Upload Logo</p>
          </label>
          <input type="file" id="file" hidden onChange={handleImageChange} />
          <button>INVOICE</button>
        </section>
      </div>

      {/* Table Content */}

      <div className="table">
        <table className="dem-Table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description of the Service/Item</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="input-one">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={row.itemName}
                    onChange={(e) => handleInputChange(e, row.id, "itemName")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Enter your description"
                    value={row.description}
                    onChange={(e) =>
                      handleInputChange(e, row.id, "description")
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    onChange={(e) => handleQuantityChange(e, row.id)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    onChange={(e) => handleRateChange(e, row.id)}
                    className="input-two"
                    style={{
                      padding: " 6px 0px 6px 30px",
                      width: "90%",
                      maxWidth: "85%",
                    }}
                  />
                  <FaIndianRupeeSign className="rs" />
                </td>
                <td className="input-three">
                  <input type="number" value={row.total} />
                </td>
                {rows.length > 1 && (
                  <td className="cancel" onClick={() => deleteRow(row.id)}>
                    <FaCircleXmark
                      style={{ cursor: "pointer", marginTop: "10px" }}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <button onClick={addRow}>
            <FaCirclePlus />
          </button>
        </div>
      </div>

      {/* Note Content */}

      <div className="note-page">
        <div className="note">
          <label>Notes :</label>
          <textarea
            placeholder="Type your notes or Terms & conditions"
            rows={6}
            onChange={(e) => setnote(e.target.value)}
          ></textarea>
        </div>
        <div className="total">
          <div>
            <label>Sub Total :</label>
            <span>
              <FaIndianRupeeSign style={{ marginBottom: "-3px" }} />{" "}
              {grandTotal}
            </span>
          </div>
          <div>
            <label>Tax % :</label>
            <input type="number" onChange={(e) => setTaxes(e.target.value)} />
          </div>
          <div>
            <label>Discount :</label>
            <input
              type="number"
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div>
            <label>Other Charges :</label>
            <input type="number" onChange={(e) => setCharges(e.target.value)} />
          </div>
          <div>
            <label onClick={() => Alltotal()} className="total-all">
              Total :{" "}
            </label>
            <span>
              <FaIndianRupeeSign style={{ marginBottom: "-3px" }} /> {allValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
