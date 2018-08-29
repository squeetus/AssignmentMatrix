# AssignmentMatrix

This is a matrix view of Nifty assignments (rows) and their related categories - topics, languages, classifications - (columns). 

The script reads the static JSON file 'scrape.json'

Next, it counts topics, languages, and classifications across all assignments and creates ordered lists of each category

We then bind a selection box to the page so users can swap among categories

Finally, the matrix is drawn. The matrix function accepts a data argument with the following attributes:
  - "rows": an array of assignment objects
  - "rowNames": an array of assignment name strings
  - "columns": an array of category name strings (depends on dropdown box; topics by default)
  - "columnTitle": a string identifier for the category (e.g. 'languages') (used for interactivey highlighting relevant assignment objects
  - "uiOpts": an object with fill and highlight color attributes (to support different schemes per category)
  
  The matrix is removed and redrawn every time the selection box is changed
 
