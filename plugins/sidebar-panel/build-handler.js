let tabRef = null;

// http://localhost:3000
// https://mr-6-hndsmq-flotiq-nextjs-blog.dev.cdwv.pl
const url = "http://localhost:3000";

let timeoutRef = null;

export const updateTabData = (values) => {
  if (timeoutRef) {
    clearTimeout(timeoutRef);
    timeoutRef = null;
  }

  if (tabRef) {
    timeoutRef = setTimeout(() => {
      tabRef.postMessage(`post-changed ${JSON.stringify(values)}`, url);
      timeoutRef = null;
    }, 500);
  }
};

/**
 *
 * @param {object} buttonSettings
 * @param {*} contentObject
 * @param {string} id
 * @returns
 */
export const onBuildHandler = (values) => {
  // eslint-disable-next-line max-len
  const buildInstance = `${url}/api/flotiq/draft?key=3edb8c7de0fd9bda84767dec9cfdac62&draft=true&redirect=/${values.slug}`;

  if (tabRef && !tabRef?.closed) {
    updateTabData(values);
  } else {
    tabRef = window.open(
      buildInstance,
      "_blank",
      "location=yes,height=1600,width=932,scrollbars=yes,status=yes",
    );
    window.tabRef = tabRef;

    updateTabData(values);
  }
};
