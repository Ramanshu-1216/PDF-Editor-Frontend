'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf'
import "react-pdf/dist/esm/Page/TextLayer.css";
import { pdfjs } from 'react-pdf';
import API_EDPOINTS from '../../api';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ISSERVER = typeof window === "undefined";
export default function Home() {
  var token: string | null = "";
  if (!ISSERVER) {
    token = localStorage.getItem('token');
  }
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null | undefined>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [checkedPages, setCheckedPages] = useState<number[]>([]);
  const [buttonText, setButtonText] = useState("Delete Pages and Download");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfFile(file);
    setError(null);
  };
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setCheckedPages(Array.from({ length: numPages }, (_, index) => index));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setError('PDF file is required');
      return;
    }
    setShowPDF(true);
    console.log('PDF file:', pdfFile);
  };

  useEffect(() => {
    if (!ISSERVER) {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        router.push('/login');
      }
    }
  }, []);

  const handleCheckboxChange = (pageNumber: number) => {
    setCheckedPages((prevCheckedPages) => {
      const isChecked = prevCheckedPages.includes(pageNumber);
      if (isChecked) {
        return prevCheckedPages.filter((page) => page !== pageNumber);
      } else {
        return [...prevCheckedPages, pageNumber];
      }
    });
  };
  const handleDeleteClick = async () => {
    setButtonText("Loading");
    if (pdfFile && token != null && token !== undefined) {
      const formData = new FormData();
      formData.append('pdfFile', pdfFile);
      formData.append('newOrder', JSON.stringify(checkedPages));
      const response = await fetch(API_EDPOINTS.editPDF, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData
      });
      const data = await response.blob();
      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(data);
      link.href = blobUrl;
      link.download = 'output_' + new Date().getTime() + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setButtonText("Delete Pages and Download");
    }
  }

  const handleLogout = () => {
    if (!ISSERVER) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }

  if (showPDF) {
    return (
      <div className='bg-gray-800 min-h-screen'>
        <div className='flex p-10'>
          <p className='text-xl flex-auto text-sky-900 font-bold'>Delete Pages</p>
          <button className='rounded-full px-10 py-2 bg-orange-400 font-semibold hover:bg-orange-100 hover:text-black text-lg' onClick={handleDeleteClick}>{buttonText}</button>
        </div>
        <div className="flex items-center md:justify-center">
          <Document file={pdfFile} onLoadError={(error) => console.log(error)} onLoadSuccess={onDocumentLoadSuccess}>
            {numPages && Array.from({ length: numPages }, (_, index) => (
              <div className='md:flex' >
                <div className='bg-gray-800'>
                  <p>Page Number: {index + 1}</p>
                  <p className='flex mr-10'>Keep this page:
                    <label className='ml-2 mt-0.5'>
                      <input
                        type="checkbox"
                        checked={checkedPages.includes(index)}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    </label>
                  </p>
                </div>
                <Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false}></Page>
              </div>
            ))}
          </Document>
        </div>
      </div>
    )
  }
  return (
    <div className='bg-gray-800 h-screen'>
      <div className='flex'>
        <p className='flex-1'></p>
        <button className='rounded-full px-10 py-2 bg-orange-400 font-semibold hover:bg-orange-100 hover:text-black text-lg m-10' onClick={handleLogout}>Logout</button>
      </div>
      <div className="flex items-center justify-center h-4/5">
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-md shadow-lg">
          <div className="mb-4">
            <label htmlFor="pdfFile" className="block text-sm font-medium text-white">
              Choose a PDF file
            </label>
            <input
              type="file"
              id="pdfFile"
              name="pdfFile"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-800 text-white"
            />
            {error && <p className="mt-1 text-red-500">{error}</p>}
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
            >
              Upload PDF
            </button>
          </div>
        </form>

      </div>
    </div>

  )
}