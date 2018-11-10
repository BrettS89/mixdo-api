exports.getPreppedTodos = (userId, todos, following, myId, discover) => {
  const preppedTodos = todos.map(todo => {
    for(let i = 0; i < todo.likes.length; i++) {
      if(todo.likes[i].toString() === userId.toString()) {
        
        return {
          ...todo,
          liked: true,
        };
      }  
    };
    return todo;
  });

  const flaggedFiltered = preppedTodos.filter(todo => {
    return todo.flagged !== true;
  });

  const todosWithAdds = flaggedFiltered.map(todo => {
      for(let i = 0; i < todo.added.length; i++) {
        if(todo.added[i].toString() === userId.toString()) {
          
          return {
            ...todo,
            didAdd: true,
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
