import { db } from "./firebaseAdmin.js";

export async function getRoutes() {
  const staticRoutes = ["/", "/search", "/games"];

  let userIds = [];
  let postMap = {};

  try {
    const userSnap = await db.ref("UsersDetails").once("value");
    if (userSnap.exists()) {
      userIds = Object.keys(userSnap.val());
    }

    const postSnap = await db.ref("Posts").once("value");
    if (postSnap.exists()) {
      const posts = postSnap.val();
      for (const [pid, post] of Object.entries(posts)) {
        if (post.uid) {
          if (!postMap[post.uid]) postMap[post.uid] = [];
          postMap[post.uid].push(pid);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error fetching Firebase data:", err);
  }

  const userRoutes = userIds.map((id) => `/${id}`);
  const postRoutes = Object.entries(postMap).flatMap(([uid, pids]) =>
    pids.map((pid) => `/${uid}/${pid}`)
  );

  return [...staticRoutes, ...userRoutes, ...postRoutes];
}
