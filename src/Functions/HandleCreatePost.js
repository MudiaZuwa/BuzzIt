import HandleFileUpload from "./HandleFileUpload";
import { getDatabase, ref, set, push } from "../Components/firebase";
import updateDataInNode from "./UpdateDataInNode";

const HandleCreatePost = async (postDetails, setStates, commentDetails) => {
  const uid = postDetails.uid;
  const postText = postDetails.postText;
  let media = commentDetails ? postDetails.media[0] : postDetails.media;

  const uploadPostMedia = async () => {
    if (media) {
      const storageFolder = !commentDetails ? "Posts" : "Comments";
      try {
        const urls = await HandleFileUpload(media, storageFolder, uid);
        media = urls;
        if (!commentDetails) uploadPostDetails();
        else await updateCommentDetails();
      } catch (error) {
        console.error("Upload failed:", error);
        setStates.setError("Upload failed:", error);
      }
    } else {
      if (!commentDetails) uploadPostDetails();
      else await updateCommentDetails();
    }
  };

  const uploadPostDetails = () => {
    const db = getDatabase();
    const postRef = push(ref(db, "Posts"));

    const postDetails = {
      postText,
      media,
      likes: [],
      reposts: [],
      comments: [],
      uid,
      id: postRef.key,
      date: Date.now(),
    };

    set(postRef, postDetails)
      .then(() => {
        setStates.setSuccess(true);
        setStates.setIsPending(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          // Handle abort error
        } else {
          const errorMessage = error.message;
          setStates.setError(errorMessage);
          setStates.setIsPending(false);
        }
      });
  };

  const updateCommentDetails = async () => {
    const postRef = `Posts/${commentDetails.postId}`;

    const newCommentDetails = {
      postText,
      media: media || "",
      likes: [],
      uid,
      date: Date.now(),
    };

    try {
      if (uid !== commentDetails.userId) {
        const updatedComments = [
          ...commentDetails.comments.map((comment) => ({
            uid: comment.uid,
            date: comment.date,
          })),
          { uid, date: newCommentDetails.date },
        ];

        await Promise.all([
          updateDataInNode(
            `notifications/${commentDetails.userId}/Activities/${commentDetails.postId}`,
            {
              comments: updatedComments,
            }
          ),
          updateDataInNode(`notifications/${commentDetails.userId}`, {
            viewed: false,
          }),
        ]);
      }

      await updateDataInNode(postRef, {
        comments: [...(commentDetails.comments || []), newCommentDetails],
      });

      setStates.setSuccess(true);
      setStates.setIsPending(false);
    } catch (error) {
      const errorMessage = error.message;
      setStates.setError(errorMessage);
      setStates.setIsPending(false);
    }
  };

  await uploadPostMedia();
};

export default HandleCreatePost;
