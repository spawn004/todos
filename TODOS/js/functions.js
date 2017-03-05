(function() {

        /* ==========================
         * Define global variables
         * =========================== */
        var tasks = [];
        var indexID = 0;
        var buttons;

        /* ==========================
         * Init
         * =========================== */
        function init() {
            // add event listener for task submitTask
            document.querySelector('.list-heading').addEventListener('keypress', submitTaskHandler);
            // add event listener for remove task
            $("#tasksContainer").on("click", ".close-button", function(e) {
                e && e.preventDefault();
                var taskId = $(this).data('taskId');
                removeTask(taskId);
            });

            countTasks();
            restoreData();
            hideToolbar();
            $("#tasksContainer").on("click", ".checkbox-circle", completeTask);
            $(".clear-completed").on("click", clearTasks);
            $("#activeBtn").on("click", showActive);
            $("#completedBtn").on("click", showCompleted);
            $("#allBtn").on("click", showAll);
            $(".dropdown-button").on("click", completeAll);
            $(".task")
                .dblclick(editTaskStart)
                .on("blur", editTaskStop);
        }

        /* ==========================
         * Getters / Setters
         * =========================== */

        function getCompletedTasks() {
            var completedTasks = tasks.filter(function(task) {
                return task.isComplete
            });
            return completedTasks
        }

        function getActiveTasks() {
            var activeTasks = tasks.filter(function(task) {
                return !task.isComplete
            });
            return activeTasks
        }

        function setActive(button) {
            button.classList.add("active");
        }




        /* ==========================
         * Work with data (Local Storage)
         * =========================== */

        /**
         * Save data
         */
        function saveData() {
            localStorage.setItem("tasks", JSON.stringify({
                data: tasks,
                indexID: indexID,
                // isComplete: isComplete
            }));
            countTasks();
        }
        /**
         * Restore data
         */
        function restoreData() {
            var dbData = JSON.parse(localStorage.getItem("tasks"));
            if (dbData) {
                tasks = dbData.data
                indexID = dbData.indexID
                    // isComplete = dbData.isComplete
                tasks.forEach(function(task) {
                    appendTask(task);
                })
            }
            countTasks();
        }

        /**
         * Save data after edit
         */
        function saveEdited(value, id) {
            id = parseInt(id);
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].id === id) {
                    tasks[i].text = value;
                }
            }
            saveData();
        }

        /* ==========================
         * Work with tasks
         * =========================== */

        /**
         * Create task and put it in tasks DB
         * @taskValue
         */
        function addTask(taskValue) {
            // taskValue = task;
            var newTask = {
                id: indexID++,
                text: taskValue,
                isComplete: false
            }
            tasks.push(newTask);
            appendTask(newTask);
            saveData();
            hideToolbar();
        }

        /**
         * Subscribe to add task field submit
         * @e
         */
        function submitTaskHandler(e) {
            var key = e.which || e.keyCode;
            var taskDom = document.querySelector(".list-heading")
            if (key === 13 && taskDom.value) {
                addTask(taskDom.value);
                // clear input
                taskDom.value = '';
            }
        }

        /**
         * Put task in HTML
         */
        function appendTask(taskData) {
            var text = document.createTextNode(taskData.text);
            var $newTask = $('<div>');
            $newTask.addClass(`list-row`);
            $newTask.attr('data-id', taskData.id);
            $newTask.html(`
          <input id="task-id-${taskData.id}" class="checkbox-circle" data-id="${taskData.id}" type="checkbox" ${taskData.isComplete ? `checked` : ``}>
          <label for="task-id-${taskData.id}" class="checked-item">
            <i class="fa fa-check" aria-hidden="true"></i>
          </label>
          <div class="task${taskData.isComplete ? ` completed` : ``}">${taskData.text}</div>
          <button id="closeBtn-${taskData.id}" class="close-button" data-task-id="${taskData.id}">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        `);
        var tasksContainer = document.querySelector("#tasksContainer");
        $(tasksContainer).append($newTask);
    }

    /**
     * Remove Task from db and HTML
     */
    function removeTask(id) {
        // remove task from db
        var taskId;
        var taskIndex = tasks.findIndex(function(task) {
            return task.id === id;
        })

        if (taskIndex > -1) {
            taskId = tasks[taskIndex].id;
            tasks.splice(taskIndex, 1);
            saveData();
            removeTaskFromDOM(taskId);
            hideToolbar();
        }
    }

    function removeTaskFromDOM(id) {
        var selector = `[data-id="${id}"]`;
        $(selector).remove();
    }

    /**
     * Count tasks and put that count in HTML
     */
    function countTasks() {
        var taskCounter = document.querySelector(".remaining-items");
        var activeTasks = getActiveTasks();
        var completedTasks = getCompletedTasks();
        taskCounter.innerHTML = activeTasks.length + " items left";
        if(activeTasks.length == 0){
          $(".clear-completed").addClass("hidden");
          $(".dropdown-button").css("color", "#737373");
          $("#activeBtn").addClass("hidden");
        } else {
          $(".clear-completed").removeClass("hidden");
          $(".dropdown-button").css("color", "#e6e6e6");
          $("#activeBtn").removeClass("hidden");
        }
        if(completedTasks.length == 0){
          $(".clear-completed").addClass("hidden");
          $("#completedBtn").addClass("hidden");
        } else {
          $(".clear-completed").removeClass("hidden");
          $("#completedBtn").removeClass("hidden");
        }
    }

    /**
     * Remove toolbar if no tasks are added
     */
    function hideToolbar() {
        if (tasks.length == 0) {
            $(".form-footer").hide();
            $(".dropdownBtn").addClass("hidden");
        } else {
            $(".form-footer").show();
            $(".dropdownBtn").removeClass("hidden");
        }
    }

    /**
     * Mark task as completed with click on checkbox
     */
    function completeTask() {
            var taskId = $(this).data('id');
            console.log(this);
            $(`.list-row[data-id=${taskId}] .task`).toggleClass("completed");
            for (var i in tasks) {
                if (taskId === tasks[i].id) {
                    tasks[i].isComplete = !tasks[i].isComplete;
                }
            }
            saveData();
    }

    /**
     * Clear completed tasks
     */
     function clearTasks() {
          $(".checkbox-circle").each(function() {
              if ($(this).is(":checked")) {
                  $(this).parent().slideToggle(function() {
                      $(this).remove();
                      removeTask($(this).data("id"));
                      saveData();
                    });
                  }
                });
        }

    /**
     * Clear completed tasks
     */
     function editTaskStart(){
          $(this)
            .addClass("is-editing")
            .prop("contenteditable", true)
            .focus()
            .siblings(".checked-item").hide()
            .siblings(".close-button").hide();
     }

     function editTaskStop(){
       $(this)
         .removeClass("is-editing")
         .prop("contenteditable", false)
         .siblings(".checked-item").show()
         .siblings(".close-button").show();

      saveEdited($(this).text(), $(this).closest('.list-row').data('id'));
     }


    /* ==========================
     * Button functions
     * =========================== */

    /**
     * Show all tasks
     */
function showAll(){
        $(".list-row input:checkbox").each(function() {
            if ($(this).is("input:checkbox")) {
                $(this).parent().show("slow");
            }
        })
}

/**
 * Show active (incomplete) tasks
 */
function showActive(){
        $(".list-row input:checkbox").each(function() {
            if ($(this).is(":not(:checked)")) {
                $(this).parent().show("slow");
            } else {
                $(this).parent().hide("slow");
            }
        })
}

/**
 * Show completed tasks
 */
function showCompleted(){
    $(".list-row input:checkbox").each(function() {
        if ($(this).is(":checked")) {
            $(this).parent().show("slow");
        } else {
            $(this).parent().hide("slow");
        }
    });
}

/**
 * Mark all tasks as completed
 */
 function completeAll() {
   var $tasks = $(".list-row .task");
   var notAllCompleted = false;
   for (var i = 0; i < $tasks.length; i++){
     if (!$($tasks[i]).hasClass("completed")){
       notAllCompleted = true;
       break;
     }
   }
   $(`.list-row`).find(".checkbox-circle").prop("checked", notAllCompleted);
   if(notAllCompleted){
       $(`.list-row .task`).addClass("completed");
   } else {
     $(`.list-row .task`).removeClass("completed");
   }
   for (var i in tasks) {
         tasks[i].isComplete = notAllCompleted;
   }
   saveData();
 }

 /**
  * Add active class to pressed filter button
  */
    buttons = document.querySelectorAll(".filter-button");
    buttons = [].slice.call(buttons)
    buttons.forEach(function(button) {
        button.addEventListener("click", clickButton)
    })

    function clickButton(e) {
        e.preventDefault
        var clickedButton = e.currentTarget
        removeActive(clickedButton);
        setActive(clickedButton);
    }

    function removeActive(clickedButton) {
        var btnGroup = clickedButton.closest(".filters");
        var groupBtns = btnGroup.querySelectorAll(".filter-button");
        groupBtns = [].slice.call(groupBtns);
        groupBtns.forEach(function(button) {
            button.classList.remove("active");
        })
    }

    /* ==========================
     * Run app
     * =========================== */
    init()
})()
