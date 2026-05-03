"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, getFirebaseMessaging } from "../lib/firebase";

export default function HomePage() {
  const [pushStatus, setPushStatus] = useState("확인중");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [watchConditions, setWatchConditions] = useState([]);

  const [form, setForm] = useState({
    name: "",
    regionKeyword: "",
    minPrice: "",
    maxPrice: "",
    platforms: [],
    propertyTypes: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
      const savedToken = localStorage.getItem("fcm_token");
      if (savedToken) setToken(savedToken);
    } else {
      setPushStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, "watchConditions"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((itemDoc) => ({
          id: itemDoc.id,
          ...itemDoc.data(),
        }));

        items.sort((a, b) => {
          const aSec = a.createdAt?.seconds || 0;
          const bSec = b.createdAt?.seconds || 0;
          return bSec - aSec;
        });

        setWatchConditions<span class="cursor">█</span>
