'use strict';

const templates = {
  articleLink: Handlebars.compile(document.querySelector('#template-article-link').innerHTML),
  tagCloudLink: Handlebars.compile(document.querySelector('#template-tagCloud-link').innerHTML),
  tagAuthorLink: Handlebars.compile(document.querySelector('#template-authors-link').innerHTML)
}

function titleClickHandler(event){
  event.preventDefault();  
  console.log('Link was clicked!');

  /* remove class 'active' from all article links  */
  const activeLinks = document.querySelectorAll('.titles a.active');

  for(let activeLink of activeLinks){
    activeLink.classList.remove('active');
  }  

  /* add class 'active' to the clicked link */
  const clickedElement = this;
  console.log('clickedElement:', clickedElement);
  clickedElement.classList.add('active');

  /* remove class 'active' from all articles */
  const activeArticles = document.querySelectorAll('.posts article.active');

  for(let activeArticle of activeArticles){
    activeArticle.classList.remove('active');
  }      

  /* get 'href' attribute from the clicked link */
  const articleSelector = clickedElement.getAttribute('href');
  console.log('hrefElement:', articleSelector);

  /* find the correct article using the selector (value of 'href' attribute) */
  const targetArticle = document.querySelector(articleSelector);
  console.log('correctArticle:', targetArticle);

  /* add class 'active' to the correct article */
  targetArticle.classList.add('active');
}

const optArticleSelector = '.post',
  optTitleSelector = '.post-title',
  optTitleListSelector = '.titles',
  optArticleTagsSelector = '.post-tags .list',
  optArticleAuthorSelector = '.post-author',
  optTagsListSelector = '.tags.list',
  optCloudClassCount = 5,
  optCloudClassPrefix = 'tag-size-',
  optAuthorsListSelector = '.authors.list';

function generateTitleLinks(customSelector = ''){
  /* remove contents of titleList */
  const titleList = document.querySelector(optTitleListSelector);
  titleList.innerHTML = '';

  /* find all the articles and save them to variable: articles */
  const articles = document.querySelectorAll(optArticleSelector + customSelector);

  let html = '';

  for(let article of articles){
    /* get the article id */
    const articleId = article.getAttribute('id');

    /* get the title from the title element */
    const articleTitle = article.querySelector(optTitleSelector).innerHTML;

    /* create HTML of the link */
    //const linkHTML = '<li><a href="#' + articleId + '"><span>' + articleTitle + '</span></a></li>';
    const linkHTMLData = {id: articleId, title: articleTitle};
    const linkHTML = templates.articleLink(linkHTMLData);

    /* insert link into html variable */
    html = html + linkHTML;
    console.log('htmlLink:', linkHTML);  
  }

  titleList.innerHTML = html;
  const links = document.querySelectorAll('.titles a');

  for(let link of links){
    link.addEventListener('click', titleClickHandler);
  }    
}

generateTitleLinks();

function calculateTagsParams(tags){
  const params = {min: 999999, max: 0};
    
  for(let tag in tags){
    console.log(tag + ' is used ' + tags[tag] + ' times');
    if(tags[tag] > params.max){
      params.max = tags[tag];
    }
    if(tags[tag] < params.min){
      params.min = tags[tag];
    }
  }
  console.log('Our params return:', params);
  return params;
}

function calculateTagClass(count, params){
  const normalizedCount = count - params.min;
  const normalizedMax = params.max - params.min;
  const percentage = normalizedCount / normalizedMax;
  const classNumber = Math.floor( percentage * (optCloudClassCount - 1) + 1 );
  console.log('Our classNumber return:', optCloudClassPrefix + classNumber);
  return optCloudClassPrefix + classNumber;
}

function generateTags(){
  /* [NEW] create a new variable allTags with an empty object */
  let allTags = {};
  
  /* find all articles */
  const articles = document.querySelectorAll(optArticleSelector);

  /* START LOOP: for every article: */
  for(let article of articles){

    /* find tags wrapper */
    const tagsWrapper = article.querySelector(optArticleTagsSelector);

    /* make html variable with empty string */
    let html = '';

    /* get tags from data-tags attribute */
    const articleTags = article.getAttribute('data-tags');

    /* split tags into array */
    const articleTagsArray = articleTags.split(' ');

    /* START LOOP: for each tag */
    for(let tag of articleTagsArray){
      /* generate HTML of the link */
      const linkHTMLData = {id: 'tag-' + tag, title: tag};
      const linkHTML = templates.articleLink(linkHTMLData);

      /* add generated code to html variable */
      html = html + linkHTML;
      /* [NEW] check if this link is NOT already in allTags */
      if(!allTags.hasOwnProperty(tag)){
        /* [NEW] add tag to allTags array */
        allTags[tag] = 1;
      } else {
        allTags[tag]++;
      }
    /* END LOOP: for each tag */
    }
    /* insert HTML of all the links into the tags wrapper */
    tagsWrapper.innerHTML = html;

  /* END LOOP: for every article: */
  }
  
  /* [NEW] find list of tags in right column */
  const tagList = document.querySelector(optTagsListSelector);
  
  const tagsParams = calculateTagsParams(allTags);
  console.log('tagsParams:', tagsParams);
  
  let allTagsData = {tags: []};
 
  
  for(let tag in allTags){      
      const tagLinkHTML = '<li><a href="#tag-' + tag + '" class=' + calculateTagClass(allTags[tag], tagsParams) + '>' + tag + '</a></li>';
      allTagsData.tags.push({
        tag: tag,
        count: allTags[tag],
        className: calculateTagClass(allTags[tag], tagsParams)
      });
  }

  /* [NEW] add html from allTags to tagList */
  tagList.innerHTML = templates.tagCloudLink(allTagsData);
}

generateTags();

function tagClickHandler(event){
  /* prevent default action for this event */
  event.preventDefault();

  /* make new constant named "clickedElement" and give it the value of "this" */
  const clickedElement = this;

  /* make a new constant "href" and read the attribute "href" of the clicked element */
  const href = clickedElement.getAttribute('href');

  /* find all tag links with class active */
  const activeTagLinks = document.querySelectorAll('a.active[href^="#tag-"]');

  /* START LOOP: for each active tag link */
  for (let activeTagLink of activeTagLinks) {
    /* remove class active */  
    activeTagLink.classList.remove('active');
    /* END LOOP: for each active tag link */
  }

  /* find all tag links with "href" attribute equal to the "href" constant */
  const allTagsWithHref = document.querySelectorAll('a[href="' + href + '"]');
  /* START LOOP: for each found tag link */
  for (let allTagWithHref of allTagsWithHref) {
    /* add class active */
    allTagWithHref.classList.add('active');
    /* END LOOP: for each found tag link */
  }  
  /* execute function "generateTitleLinks" with article selector as argument */
  generateTitleLinks('[data-tags~="' + clickedElement.innerHTML + '"]');
  
}

function addClickListenersToTags(){
  /* find all links to tags */
  const linksToTag = document.querySelectorAll('.post-tags a');

  /* START LOOP: for each link */
  for (let linkToTag of linksToTag) {
    /* add tagClickHandler as event listener for that link */
    linkToTag.addEventListener('click', tagClickHandler);
    /* END LOOP: for each link */
  }
}

addClickListenersToTags();

function generateAuthors(){
  let allAuthors = {};
  
  /* find all articles */
  const articles = document.querySelectorAll(optArticleSelector);

  for(let article of articles){
    /* find authors wrapper */
    const authorWrapper = article.querySelector(optArticleAuthorSelector);

    /* get author from data-author attribute */
    const articleAuthor = article.getAttribute('data-author');
    
    const linkHTMLData = {id: 'author-'+ articleAuthor, title: articleAuthor};
    const linkHTML = templates.articleLink(linkHTMLData);
    if(!allAuthors.hasOwnProperty(articleAuthor)){
      allAuthors[articleAuthor] = 1;
    } else {
      allAuthors[articleAuthor]++; 
    }

    /* insert articleAuthor into the author wrapper */
    authorWrapper.innerHTML = linkHTML;
  } 
  
  /* [NEW] find list of authors in right column */
  const authorList = document.querySelector(optAuthorsListSelector);

  /* [NEW] add html from allAuthors to authorList */
  const allAuthorsData = {authors: []};
  for(let author in allAuthors){
    //allAuthorsHTML += '<li><a href="#author-' + author + '">' + author + ' (' + allAuthors[author] + ') ' + '</a></li>';
    allAuthorsData.authors.push({
    author: author,
    count: allAuthors[author]
    });
  }
  authorList.innerHTML = templates.tagAuthorLink(allAuthorsData);
}

generateAuthors();

function authorClickHandler(event){
  event.preventDefault();

  const clickedElement = this;

  const href = clickedElement.getAttribute('href');

  const activeTagLinks = document.querySelectorAll('a.active[href^="#author-"]');

  for (let activeTagLink of activeTagLinks) {
    activeTagLink.classList.remove('active');
  }

  const allTagsWithHref = document.querySelectorAll('a[href="' + href + '"]');

  for (let allTagWithHref of allTagsWithHref) {
    allTagWithHref.classList.add('active');
  }  
  generateTitleLinks('[data-author="' + clickedElement.innerHTML + '"]');
  
}

function addClickListenersToAuthors(){

  const linksToTag = document.querySelectorAll('.post-author a');

  for (let linkToTag of linksToTag) {
    linkToTag.addEventListener('click', authorClickHandler);
  }
}

addClickListenersToAuthors();