// 	 code only runs on the client
Template.books.helpers({
	//retornar os livros salvos no banco
	books: function() {
		return Books.find({}, {sort: {createdAt: -1}});
	},
});
Template.newbook.events({
	'keyup input[name="title"]' : function(e){
		var _inputSearch = $('input[name="title"]')
		,   _searchVal = _inputSearch.val()
		,   _insertBookForm = $('#insertBookForm');
		if(_searchVal.length > 3){
			clearTimeout(requestBooks);
			requestBooks = setTimeout(function(){
				$.getJSON('https://www.googleapis.com/books/v1/volumes?q=title+'+_searchVal,function(resp){
					var resp = bookFormat.formatJSON(resp.items)
					,   HTMLBooks = bookFormat.buildHTML(resp);
					$('ul',_insertBookForm).remove();
					_inputSearch.after(HTMLBooks);
				});
			},1000);
		}
  }

});
var bookFormat = bookFormat || {}
,  requestBooks = null;
(function(){
	function formatJSON (respJSON){
		if(typeof respJSON == 'object'){
			var JSONformated = [];
			for (var i in respJSON) {
				var book = respJSON[i].volumeInfo;
				if(book.authors){
					var authors = book.authors[0].split('/');
					if(authors.length > 1){
						var names = authors[0].split(',')
						,   author = names[1]+' '+names[0];
					}else{
						var author = book.authors[0].split(',');
						if(author.length > 1){
							author = author[1]+' '+author[0];
						}else{
							author = author[0];
						}
					}
				}else{
					authors = undefined;
				}
				JSONformated[i] = {
					title:       book.title,
					author:      author,
					pages:       book.pageCount,
					image:       book.imageLinks ? book.imageLinks.smallThumbnail : undefined,
					publisher:   book.publisher,
					language:    book.language,
					description: book.description,
					isbn:        book.industryIdentifiers && book.industryIdentifiers[1] ? book.industryIdentifiers[1].identifier : undefined
				};
			}
		}
		return JSONformated;
	}
	function buildHTML(books){
		var html = '<ul>';
		for (var i in books) {
			html+=
				'<li>'
					+'<b>'+books[i].title+' - </b>'
					+'<span>'+books[i].author+'</span>';
				+'</li>';
		}
		html += '</ul>';
		return html;
	}

	bookFormat.formatJSON = formatJSON;
	bookFormat.buildHTML  = buildHTML;
})();
