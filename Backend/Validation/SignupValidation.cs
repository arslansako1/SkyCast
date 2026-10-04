

using FluentValidation;

public class SignupValidation : AbstractValidator<SignupRequest>
{
    public SignupValidation()
    {
        RuleFor(x => x.FirstName)
        .Cascade(CascadeMode.Continue)
        .NotEmpty().WithMessage("FirstName shouldnt be empty")
        .MaximumLength(12).WithMessage("Maximum length should not pass 12")
        .MinimumLength(5).WithMessage("Minimum length should not go below 5");

        RuleFor(x => x.LastName)
        .Cascade(CascadeMode.Continue)
        .NotEmpty().WithMessage("LastName shouldnt be empty")
        .MaximumLength(12).WithMessage("Maximum length should not pass 12")
        .MinimumLength(5).WithMessage("Minimum length should not go below 5");

        RuleFor(x => x.Email)
        .Cascade(CascadeMode.Continue)
        .NotEmpty().WithMessage("Email shouldnt be empty")
        .MaximumLength(30).WithMessage("Maximum length should not pass 30")
        .MinimumLength(15).WithMessage("Minimum length should not go below 15");

        RuleFor(x => x.Password)
        .Cascade(CascadeMode.Continue)
        .NotEmpty().WithMessage("Password shouldnt be empty")
        .MaximumLength(30).WithMessage("Maximum length should not pass 30")
        .MinimumLength(5).WithMessage("Minimum length should not go below 5");


        RuleFor(x => x.ConfirmPassword)
        .Cascade(CascadeMode.Continue)
        .NotEmpty().WithMessage("Password shouldnt be empty")
        .Equal(x => x.Password).WithMessage("Passwords must match!");
   
        
    }
}
