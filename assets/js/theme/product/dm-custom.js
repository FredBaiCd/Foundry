export default function () {
   
    $(".product-picklist-image-wrap").mouseover(function(){
        $(this).next().show();
    });
    $(".product-picklist-image-wrap").mouseout(function(){
        $(this).next().hide();
    });
    
    $('.product-description a:contains("Post Install Instructions")').addClass('instructionsBtn');
    $('.product-description a:contains("Jamb Install Instructions")').addClass('instructionsBtn');
    $('.product-description a:contains("INSTALL INSTRUCTIONS")').addClass('instructionsBtn');
    
    
    $('.product-customizations .form-field-customizations:contains("LEAD TIME")').find('.form-input').val('.');
    $('.product-customizations .form-field-customizations:contains("Lead Time")').find('.form-input').val('.');
  
}
