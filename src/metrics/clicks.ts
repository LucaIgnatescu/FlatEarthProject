export function ClickTracker() {
  console.log("registering tracker")
  window.addEventListener('click', () => {
    console.log("click");
  })
}
