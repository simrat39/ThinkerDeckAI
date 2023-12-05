document.addEventListener('DOMContentLoaded', () => {

    const swiper = new Swiper('.swiper-container', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        pagination: {
            el: '.swiper-pagination',
        },
    });


    const cards = Array.from(document.querySelectorAll('.swiper-slide'));
    let score = 0; 

    cards.forEach((card, index) => {

        interact(card)
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            onmove: (event) => {
                const { target } = event;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            onend: (event) => {
                const { target, dx } = event;
                const x = parseFloat(target.getAttribute('data-x')) || 0;

                // If swiped right significantly, consider it as correct
                if (dx > 100) {
                    // Increase score for correct answer
                    score++;
                    target.classList.add('correct'); 
                }
                // If swiped left significantly or not a strong right swipe, consider it wrong
                if (dx < -100 || (dx > 0 && dx <= 100)) {
                    target.classList.add('incorrect'); 
                }


                target.style.opacity = 0;
                setTimeout(() => {
                    target.remove();
                    // Check if we're at the last card
                    if (index === cards.length - 1) {
                        showEndMessage();
                    }
                }, 500);


                target.setAttribute('data-x', 0);
                target.setAttribute('data-y', 0);
            }
        });
    });


    function showEndMessage() {
        const endMessage = document.createElement('div');
        endMessage.classList.add('score-container'); 

        endMessage.innerHTML = `
            <div class="score-card">
                <h2>Quiz Completed</h2>
                <p>No more questions available.</p>
                <p>Your score: ${score}</p>
                <button class="restart-button">Restart Quiz</button> <!-- Add a restart button if needed -->
            </div>`;


        document.body.appendChild(endMessage);


        endMessage.querySelector('.restart-button').addEventListener('click', restartQuiz);
    }

     // Function to restart the quiz
     function restartQuiz() {

        // Reset score
        score = 0;

        // Remove the end message
        document.querySelector('.score-container').remove();

        // Reinitialize the cards
      
        cards.forEach(card => {
            swiper.appendSlide(card); // Add the card back to swiper
            card.style.opacity = 1; 
        });
        swiper.slideTo(0); // Go back to the first slide
    }
});