exports.getPreppedTodos = (userId, todos, following, myId, discover) => {
  const preppedTodos = todos.map(todo => {
    for(let i = 0; i < todo.likes.length; i++) {
      if(todo.likes[i].toString() === userId.toString()) {
        
        return {
          _id: todo._id,
          date: todo.date,
          createdDate: todo.createdDate,
          user: todo.user,
          description: todo.description,
          metaData: todo.metaData,
          finished: todo.finished,
          likes: todo.likes,
          liked: true,
          added: todo.added,
          comments: todo.comments
        };
      }  
    };
    return todo;
  });

  const todosWithAdds = preppedTodos.map(todo => {
      for(let i = 0; i < todo.added.length; i++) {
        if(todo.added[i].toString() === userId.toString()) {
          
          return {
            _id: todo._id,
            date: todo.date,
            createdDate: todo.createdDate,
            user: todo.user,
            description: todo.description,
            metaData: todo.metaData,
            finished: todo.finished,
            likes: todo.likes,
            liked: todo.liked,
            added: todo.added,
            didAdd: true,
            comments: todo.comments
          };
        }  
      };
    return todo;
  });

  if(discover) {
    const todosWithFollowing = todosWithAdds.map(todo => {
      following.push(myId);
      for(let user of following) {
        if(user.toString() === todo.user._id.toString()) {
          return {
            ...todo,
            following: true
          }
        }
      }
      return todo;
    });
    return todosWithFollowing;
  }
  
  return todosWithAdds;  
};
