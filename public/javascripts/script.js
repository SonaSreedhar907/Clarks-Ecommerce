function addToCart(prodId) {
    console.log(prodId,"productid for ajax");
    $.ajax(
        {
            url: `/add-to-cart/${prodId}`,
            method: "get",
            success: (response) => {
                console.log("soooooooooonaaa");
                if (response.status) {
                    let count = $("#cart-count").html();
                    count = parseInt(count) + 1;
                    $("#cart-count").html(count);
                    document.getElementById("success").classList.remove("d-none");
                    setTimeout(function () {
                        document.getElementById("success").classList.add("d-none");
                    }, 1000);
                } else {
                    location.href = "/login";
                }
            },
            error: (error) => {
                console.log(error);
            }
        });
}

function addToWishList(proId) {
    console.log(proId)
    $.ajax({
      url: '/addToWishList/' + proId,
      method: 'get',
      success: (response) => {
  
        if (response.status) {
          let count = $('#wishListCount').html()
          count = parseInt(count) + 1
          
          $("#wishListCount").html(count)
          Swal.fire({
            icon: 'success',
            title: 'Added to Wish List',
          })
        }else {
  
          Swal.fire({
            icon: 'warning',
            title: 'Out of Stock',
          }).then(() => {
            location.reload();
          });
  
  
        }
        
      }
    })
  }

  function Toastify(options) {
    var toast = document.createElement("div");
    toast.innerText = options.text;
    toast.classList.add("toast");
    
    // Apply style to the toast element
    Object.assign(toast.style, options.style);
    
    // Set toast position and gravity
    toast.style.position = options.position || "fixed";
    toast.style.bottom = options.gravity === "bottom" ? "20px" : null;
    toast.style.top = options.gravity === "top" ? "20px" : null;
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    
    // Append toast to the document body
    document.body.appendChild(toast);
    
    // Remove toast after the specified duration
    setTimeout(function() {
        document.body.removeChild(toast);
    }, options.duration || 3000);
}



  
