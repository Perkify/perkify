export const generateDictFromSnapshot = (
  snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) => {
  const res: Record<string, FirebaseFirestore.DocumentData> = {};
  snapshot.forEach((doc) => {
    res[doc.id] = doc.data();
  });
  return res;
};
