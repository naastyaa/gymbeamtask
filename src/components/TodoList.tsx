import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../store"
import { FaCheck } from "react-icons/fa";
import { removeTodo, setTodos, startLoading, updateTodo } from "../store/todosSlice";
import { TodoItem } from "../interfaces/todoInterface";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../App";
import { setForm } from "../store/modalSlice";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { IoIosArrowDown } from "react-icons/io";
import { TbMoodSad } from "react-icons/tb";

const TodoList = () => {

  const { data , loading,sortBy } = useSelector((state: RootState) => {
    return state.todos
  })
  

  const dispatch = useDispatch<AppDispatch>();

  const handleUpdateTodo = async (todo: TodoItem) => {
    dispatch(startLoading());

    await axios.put<TodoItem>(API_BASE + '/' + todo.id, todo)
    dispatch(updateTodo(todo))
  }

  const fetchTodos = async () => {
    const res = await axios.get<TodoItem[]>
      (API_BASE)



    dispatch(setTodos(res.data
      .sort((a, b) => b.creationDate.localeCompare(a.creationDate))))
  }

  const handleDelete = async (id: TodoItem['id']) => {
    dispatch(startLoading());

    await axios.delete(API_BASE + '/' + id)

    dispatch(removeTodo(id))
  }




  const handleUpdate = (todo: TodoItem) => {
    dispatch(setForm(todo))
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const animationRef = useRef(false)
  
  useGSAP(() => {
    if (!loading && !animationRef.current) {
      animationRef.current = true;
      gsap.from(todosRefs.current, {
        ease: 'power3.out',
        translateY: -20,
        opacity: 0.3,
        stagger: 0.3,
      });
    }
  }, [data]);
  
  
  
  
  
  const todosRefs = useRef<HTMLDivElement[]>([]);
  const detailsRefs = useRef<HTMLDivElement[]>([])


  const toggleDetails = (i:number) => {
    if (detailsRefs.current[i].style.height === '0px') {
      gsap.fromTo(detailsRefs.current[i], { height: 'auto', opacity: 0 ,display:'flex',padding: "16px"}, { height: 'auto', opacity: 1, duration: 0.3 ,padding: "16px" });
      gsap.to(todosRefs.current[i].children[0],{duration:0.3, borderBottomLeftRadius:0 ,borderBottomRightRadius:0 })
      gsap.to(todosRefs.current[i].children[0].children[1].children[1].children[1], { scaleY: -1, duration: 0.8, ease: 'power3.out' });
    } else {
      gsap.to(todosRefs.current[i].children[0].children[1].children[1].children[1], { scaleY: 1, duration: 0.4, ease: 'power3.in' });
      gsap.to(detailsRefs.current[i], { height: 0, opacity: 0, duration: 0.3 ,padding:0 });
      gsap.to(todosRefs.current[i].children[0],{duration:0.3, borderBottomLeftRadius:"12px" ,borderBottomRightRadius:"12px" })
  }
  }

  const sortedTodos = [...data].sort((a, b) => {
    switch (sortBy) {
      case "Date":
        return b.creationDate.localeCompare(a.creationDate);
      case "Priority":
        if (a.priority !== b.priority) {
          return b.priority - a.priority; 
        } else {
          return b.creationDate.localeCompare(a.creationDate);
        }
      case "Due date":
        if (a.dueDate === null && b.dueDate === null) {
          return b.creationDate.localeCompare(a.creationDate);
        } else if (a.dueDate === null) {
          return 1; 
        } else if (b.dueDate === null) {
          return -1; 
        } else {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(); 
        }
      default:
        return 0;
    }
  });

  const renderedTodos = sortedTodos.map((todo, i) => {

    const getDays = () => {

      if (todo.dueDate) {
        if (new Date(todo.dueDate) > new Date()) {
          const differenceMs = Math.abs(new Date(todo.dueDate).getTime() - new Date().getTime());

          const MS_PER_DAY = 1000 * 60 * 60 * 24;
          const differenceDays = Math.ceil(differenceMs / MS_PER_DAY);
          return differenceDays;
        }
        else {
          return "Todo is overdue"
        }
      } else {
        return "No time limit"
      }


    }


    return (
      <div ref={(el) => {
        if (el) todosRefs.current[i] = el;
      }}
        className={` overflow-hidden  todo_item  w-full md:w-2/3 lg:w-1/2 ${getDays() === 'Todo is overdue' && 'ring-2 ring-red-600 rounded-xl'} ${todo.status && ' line-through'}  `} key={todo.id}>
        <div className="z-10 w-full flex rounded-xl  bg-cyan-300 dark:bg-cyan-400  px-3 pt-3 gap-x-4 justify-between" >
          <div>
            <button className="control-button  dark:bg-gray-100" onClick={() => {
              const updatedTodo = {
                ...todo,
                status: !todo.status,
              }
              handleUpdateTodo(updatedTodo)
            }}>
              {todo.status ? <FaCheck  /> : null}
            </button>
          </div>

          <div className="flex flex-col w-full items-center">

            <div className="text-start w-full font-semibold flex justify-between">
              <p className="break-all">
                {todo.title}
              </p>
              <p>
                {typeof getDays() === 'number' ? getDays() + " days left" : getDays()}
              </p>

            </div>

            <div className="cursor-pointer flex items-center" onClick={()=>toggleDetails(i)}>
            <p>
            Details
            </p>
            <div>
            <IoIosArrowDown  />
            </div>
            </div>
          </div>
          <div className="flex gap-x-2">
            <button className="control-button" onClick={() => handleUpdate(todo)}><MdEdit size={23} /></button>

          </div>
        </div>
        <div ref={(el) => {
          if (el) detailsRefs.current[i] = el;
        }}
          
          className="bg-sky-200 dark:bg-sky-300 rounded-b-xl w-full flex-col hidden opacity-0" style={{height:0}}>
          <p className="break-all">
            {todo.notes ? todo.notes : 'No description'}
          </p>

          <div className="flex flex-col items-end sm:flex-row justify-between w-full">
            <div className="sm:w-auto w-full">
              <p>Created:{todo.creationDate}</p>
              <p>Due date:{getDays() === 'No time limit' ? getDays() : new Date(todo.dueDate!).toLocaleString()}</p>
            </div>

            <div>
              <button className="control-button" onClick={() => handleDelete(todo.id)}><MdDelete size={22} /></button>
            </div>
          </div>
        </div>
      </div>
    )
  })



  return (
    <div id="todo-list" className="w-full px-4 py-6 flex flex-col gap-y-4 items-center">
      {renderedTodos.length ? renderedTodos : 
      <div className="shadow-lg px-3 font-semibold py-2 rounded-xl bg-cyan-100 dark:bg-sky-700 flex items-center">No todos yet<TbMoodSad size={25}/></div>}

    </div>
  )
}

export default TodoList