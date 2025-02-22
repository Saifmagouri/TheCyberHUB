import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { feedReset, getAllFeeds } from "src/features/feeds/feedsSlice";
import { Wrapper } from "src/components/Dashboard/Profile/ProfileElements";
import AddFeedComment from "./FeedComments/AddFeedComment";

import { FeedContentSection, FeedPageContainer } from "./FeedPageElements";
import { getAllUserDetails, userDetailReset } from "src/features/userDetail/userDetailSlice";
import { FeedLikeReset, getFeedLikes } from "src/features/feeds/feedLikes/feedLikesSlice";
import { getBookmarks } from "src/features/bookmarks/bookmarkSlice";
import { getViews } from "src/features/feeds/views/viewSlice";
import { feedReplyReset, getFeedComments } from "src/features/feeds/feedComments/feedCommentsSlice";

import FeedPagePost from "./FeedPagePost";
import FeedReplies from "./FeedComments/FeedComments";
import LoadingSpinner from "src/components/Other/MixComponents/Spinner/LoadingSpinner";
import UnderMaintenance from "src/components/Other/UnderMaintenance/UnderMaintenance";
import apiStatus from "src/features/apiStatus";

const FeedPage = () => {
    const { isApiLoading, isApiWorking } = apiStatus();

    const dispatch = useDispatch();
    const { feedId } = useParams();
    const { feeds, isFeedLoading, isFeedError, feedMessage } = useSelector((state) => state.feeds);
    const { feedComments, isFeedReplyLoading, isFeedReplyError, feedCommentMessage } = useSelector(
        (state) => state.feedComments,
    );
    const { user, isUserError, userMessage } = useSelector((state) => state.auth);
    const { userDetails, isUserDetailLoading, isUserDetailError, userDetailMessage } = useSelector(
        (state) => state.userDetail,
    );
    const { feedLikes, isFeedLikeError, isFeedLikeLoading, feedLikeMessage } = useSelector((state) => state.feedLikes);
    const { bookmarks } = useSelector((state) => state.bookmarks);
    const { views } = useSelector((state) => state.views);

    useEffect(() => {
        if (isFeedError) console.log(feedMessage);
        if (isFeedReplyError) console.log(feedCommentMessage);
        if (isUserError) console.log(userMessage);
        if (isUserDetailError) console.log(userDetailMessage);
        if (isFeedLikeError) console.log(feedLikeMessage);

        dispatch(getAllFeeds());
        dispatch(getFeedComments());
        dispatch(getAllUserDetails());
        dispatch(getFeedLikes());
        dispatch(getBookmarks());
        dispatch(getViews());

        return () => {
            dispatch(feedReset());
            dispatch(userDetailReset());
            dispatch(FeedLikeReset());
            dispatch(feedReplyReset());
        };
    }, [dispatch]);

    console.log(feedComments);

    const feed = feeds?.find((feed) => feed?._id === feedId) || feedComments?.find((feed) => feed?._id === feedId);

    const userDetail = userDetails?.find((userDetail) => userDetail?.user === feed?.user);

    // console.log(blogComments)

    const combinedData = {
        ...feed,
        username: userDetail?.username,
        avatar: userDetail?.avatar,
        verified: userDetail?.verified,
    };

    const feedLikesData = ({ feedId }) => {
        return feedLikes?.filter((like) => like?.itemId === feedId);
    };

    const feedUserBookmarksData = ({ feedId }) => {
        return bookmarks?.length > 0
            ? bookmarks?.filter((bookmark) => bookmark?.itemId === feedId) &&
                  bookmarks?.filter((bookmark) => bookmark.user === user._id)
            : [];
    };

    const feedViewsData = ({ feedId }) => {
        return views?.filter((view) => view.itemId === feedId);
    };

    const feedRepliesData = feedComments?.map((reply) => {
        const userDetail = userDetails?.find((userDetail) => userDetail?.user === reply?.user);

        const { username, avatar, verified } = userDetail || {};

        return { ...reply, username, avatar, verified };
    });

    const feedCommentsData = ({ feedId }) => {
        return feedRepliesData?.filter((reply) => reply?.feedId === feedId);
    };

    if (isApiLoading || isUserDetailLoading || isFeedLoading) return <LoadingSpinner />;

    if (!isApiWorking) return <UnderMaintenance />;

    console.log(feedId, feed);
    if (!feed) {
        return <p>Feed not found</p>;
    }

    return (
        <Wrapper style={{ margin: "80px auto" }}>
            <FeedPageContainer>
                <FeedContentSection>
                    <FeedPagePost
                        feed={combinedData}
                        user={user}
                        likes={feedLikesData({ feedId: feed._id })}
                        bookmarks={feedUserBookmarksData({ feedId: feed._id })}
                        views={feedViewsData({ feedId: feed._id })}
                        comments={feedCommentsData({ feedId: feed._id })}
                        isFeedLikeLoading={isFeedLikeLoading}
                        updateFeedView={true}
                    />

                    <AddFeedComment feedId={feedId} userDetails={userDetails} />

                    <FeedReplies
                        user={user}
                        replies={feedCommentsData({ feedId })}
                        bookmarks={bookmarks}
                        likes={feedLikes}
                        views={views}
                        isFeedReplyLoading={isFeedReplyLoading}
                        updateFeedView={true}
                    />
                </FeedContentSection>
            </FeedPageContainer>
        </Wrapper>
    );
};

export default FeedPage;
