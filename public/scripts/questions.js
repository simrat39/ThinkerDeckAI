document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category_id = urlParams.get('category_id'); 

    fetch(`/category/${category_id}/questions`)
        .then(response => response.json())
        .then(questions => {
            questions.forEach(question => {
                // Create question element
                const questionElem = document.createElement('div');
                const questionText = document.createElement('h2');
                questionText.textContent = question.question_text;
                questionElem.appendChild(questionText);

                // Create list of options
                const optionsList = document.createElement('ul');
                question.options.forEach(option => {
                    const optionItem = document.createElement('li');
                    optionItem.textContent = option.option_text;
                    if(option.is_correct) {
                        optionItem.classList.add('correct'); // Add your own styling for the correct option
                    }
                    optionsList.appendChild(optionItem);
                });

                questionElem.appendChild(optionsList);
                document.body.appendChild(questionElem); // Append to a specific element as needed
            });
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });
});
