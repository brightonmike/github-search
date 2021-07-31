/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import { Formik } from 'formik';

const Search = () => {
  const [searchPage, setSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResultCount, setSearchResultCount] = useState(0);
  const [endCursor, setEndCursor] = useState('');
  const [startCursor, setStartCursor] = useState('');
  const [searchResults, setSearchResults] = useState([]);


  const [showNextPage, setShowNextPage] = useState(false);
  const [showPrevPage, setShowPrevPage] = useState(false);

  const fetchSearchResults = useCallback((prevOrNext) => {
    const isPrevious = (prevOrNext === 'prev');
    const isNext = (prevOrNext === 'next');
    if (searchTerm) {
      fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          query: `
              query {
                search(
                  query:"${searchTerm}", 
                  type: USER,
                  ${(isNext && endCursor) ? `after: "${endCursor}" first: 10` : ''}
                  ${(isPrevious && startCursor) ? `before: "${startCursor}" last: 10` : ''}
                  ${(!isPrevious && !isNext) ? 'first: 10' : ''}
                ) {
                  userCount
                  pageInfo {
                    endCursor
                    startCursor
                    hasNextPage
                    hasPreviousPage
                  }
                  nodes {
                    ... on User {
                      databaseId
                      avatarUrl
                      bio
                      login
                      name
                      url
                      followers {
                        totalCount
                      }
                      starredRepositories {
                        totalCount
                      }
                      repositoriesContributedTo {
                        totalCount
                      }
                    }
                  }
                }
              }
            `,
        }),
      })
      .then(response => response.json())
      .then(data => {
        const { data: searchData = {} } = data;
        const { search = {} } = searchData;
        const { pageInfo = {}, nodes = [], userCount } = search;
        const {
          endCursor: cursorEnd,
          startCursor: cursorStart,
          hasNextPage,
          hasPreviousPage,
        } = pageInfo;
  
        setSearchResults(nodes);
        setStartCursor(cursorStart);
        setEndCursor(cursorEnd);
        setSearchResultCount(userCount);

        setShowNextPage(hasNextPage);
        setShowPrevPage(hasPreviousPage);

        if (isPrevious) {
          setSearchPage(searchPage - 1);
        } else if (isNext) {
          setSearchPage(searchPage + 1);
        } else {
          setSearchPage(1);
        }
      });
    }
  }, [
    endCursor,
    searchPage,
    searchTerm,
    startCursor,
  ]);

  useEffect(() => {
    if (searchTerm) {
      fetchSearchResults();
    }
  }, [searchTerm]);

  const SearchPagination = () => (
    <nav className="search__pagination">
      <div>{searchResultCount} results</div>
      <div>Page {searchPage}</div>
      {showPrevPage && (<button type="button" onClick={() => { fetchSearchResults('prev'); }}>Previous page</button>)}
      {showNextPage && (<button type="button" onClick={() => { fetchSearchResults('next'); }}>Next page</button>)}
    </nav>
  );
  
  return (
    <div className="search">
     <Formik
       initialValues={{ search: '' }}
       validate={values => {
         const errors = {};
         if (!values.search) {
           errors.search = 'Please enter a search term';
         }
         return errors;
       }}
       onSubmit={(values, { setSubmitting }) => {
         setTimeout(() => {
           setSearchTerm(values.search);
           setSubmitting(false);
         }, 400);
       }}
     >
       {({
         values,
         errors,
         touched,
         handleChange,
         handleBlur,
         handleSubmit,
         isSubmitting,
         /* and other goodies */
       }) => (
         <form onSubmit={handleSubmit} className="search__form">
           <input
             type="search"
             name="search"
             onChange={handleChange}
             onBlur={handleBlur}
             value={values.search}
           />
           {errors.search && touched.search && (<div className="search__form-error">{errors.search}</div>)}
           <button type="submit" disabled={isSubmitting}>
             Submit
           </button>
         </form>
       )}
     </Formik>
     {(searchResults.length > 0) && (
        <div className="search__results">
          <SearchPagination />
          <ul>
            {searchResults.map((searchResult) => (
              <li key={searchResult.databaseId}>
                <article className="search__result">
                  {searchResult.avatarUrl && (
                    <img alt="" src={searchResult.avatarUrl} width="100" height="100" />
                  )}
                  <div>
                    <h3><a target="_blank" rel="noreferrer" href={searchResult.url}>{searchResult.login}<span>👋</span></a></h3>
                    <h4><span>🙋‍♂️🙋‍♀️</span> {searchResult.followers.totalCount} followers</h4>
                    <h4><span>🏅</span>{searchResult.repositoriesContributedTo.totalCount} repo contributions</h4>
                    <h4><span>⭐</span>{searchResult.starredRepositories.totalCount} starred repos</h4>
                    <p>{searchResult.bio}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <SearchPagination />
        </div>
     )}
    </div>
  );
};

export default Search;
