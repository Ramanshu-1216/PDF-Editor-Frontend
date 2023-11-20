'use client'
import { useEffect, useState } from 'react';
import {useRouter} from 'next/navigation';

const editPDF = () => {
    const router = useRouter();
    const file = JSON.parse(localStorage.getItem('files'));
    console.log(file)
    return (
        <div>{'file'}</div>
    )
}

export default editPDF;