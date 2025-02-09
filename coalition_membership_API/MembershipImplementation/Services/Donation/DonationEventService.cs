using Implementation.DTOS.Authentication;
using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.DTOS.Donation;
using MembershipImplementation.DTOS.Payment;
using MembershipImplementation.Helper;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Interfaces.Donation;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Donation;
using MembershipInfrustructure.Model.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace MembershipImplementation.Services.Donation;

public class DonationEventService : IDonationEventService
{
    private readonly ApplicationDbContext _dbContext;
private readonly IGeneralConfigService _generalConfigService;
private readonly IEmailService _emailService;
private readonly IGeneralConfigService _generalConfig;
public DonationEventService(ApplicationDbContext dbContext, IGeneralConfigService generalConfigService,IEmailService emailService,IGeneralConfigService generalConfig)
{
    _dbContext = dbContext;
    _generalConfigService = generalConfigService;   
    _emailService = emailService;
    _generalConfig = generalConfig;
}

public async Task<ResponseMessage<string>> AddDonationEvent(DonationEventPostDto donationEventPostDto)
{
    try
    {
        
        var eventImage = "";


        if (donationEventPostDto.ImageFile != null)
        {
            eventImage = await _generalConfigService.UploadFiles(donationEventPostDto.ImageFile, donationEventPostDto.Title, "Event_Message");
        }

        
        var donationEvent = new DonationEvent
        {
            Id = Guid.NewGuid(),
            Title = donationEventPostDto.Title,
            ImagePath = eventImage ,
            SubTitle = donationEventPostDto.SubTitle,
            Description = donationEventPostDto.Description,
            IsDonation = donationEventPostDto.IsDonation,
            Amount = donationEventPostDto.Amount,
            CreatedDate = DateTime.UtcNow,
            Rowstatus = EnumList.RowStatus.ACTIVE,
         
        };

        await _dbContext.DonationEvents.AddAsync(donationEvent);
        await _dbContext.SaveChangesAsync();

       var response =  await _generalConfig.SendNotificationToAllUsersAsync(new NotificationRequestDto()
            {
                Title = donationEvent.Title,
                Body = donationEventPostDto.Description,
            }
        );

        return new ResponseMessage<string>()
        {
            Success = true,
            Message = "DonationEvent has been added",
        };
    }
    catch (Exception ex)
    {
        return ExceptionHandler.HandleException<string>(ex);

    }
}

public async Task<ResponseMessage<string>> UpdateDonationEvent(Guid id, DonationEventPostDto donationEventPostDto)
{
    try
    {
        var donationEvent = await _dbContext.DonationEvents.FindAsync(id);
        if (donationEvent == null) throw new KeyNotFoundException("DonationEvent not found");

        donationEvent.Title = donationEventPostDto.Title;
        donationEvent.SubTitle = donationEventPostDto.SubTitle;
        donationEvent.Description = donationEventPostDto.Description;
        donationEvent.IsDonation = donationEventPostDto.IsDonation;
        donationEvent.Amount = donationEventPostDto.Amount;

        if (donationEventPostDto.ImageFile != null)
        {
            var eventImage = "";


            if (donationEventPostDto.ImageFile != null)
            {
                eventImage = await _generalConfigService.UploadFiles(donationEventPostDto.ImageFile,
                    donationEventPostDto.Title, "Event_Message");
            }

            donationEvent.ImagePath = eventImage;

        }

        await _dbContext.SaveChangesAsync();

        return new ResponseMessage<string>()
        {
            Success = true,
            Message = "Donation event updated successfully.",
        };
    }
    catch (Exception ex)
    {
        return ExceptionHandler.HandleException<string>(ex);
    }

}

public async Task<ResponseMessage<string>> RemoveDonationEvent(Guid id)
{

    try
    {
        var donationEvent = await _dbContext.DonationEvents.FindAsync(id);
        if (donationEvent == null)
            return new ResponseMessage<string>()
            {

                Success = false,
                Message = "DonationEvent not found",
            };

        _dbContext.DonationEvents.Remove(donationEvent);
        await _dbContext.SaveChangesAsync();

        return new ResponseMessage<string>()
        {

            Success = true, Message = "Donation event removed successfully.",
        };
    }
    catch (Exception ex)
    {
        return ExceptionHandler.HandleException<string>(ex);
    }
}

public async Task<ResponseMessage<List<DonationEventGetDto>>> GetAllDonationEvents()
{
    try
    {
        var donationEvents =  await _dbContext.DonationEvents
            .Select(x=> new DonationEventGetDto
                {
                    
                    Id = x.Id.ToString(),
                    Title = x.Title,
                    SubTitle = x.SubTitle,
                    Description = x.Description,
                    IsDonation = x.IsDonation,
                    Amount = x.Amount,
                    CreatedDate = x.CreatedDate,
                    AmountCollected = _dbContext.DonationEventDetails.Where(y=>y.DonationEventId == x.Id&&y.IsPaid).Sum(z=>z.Amount),
                    ImagePath = x.ImagePath
                })
                
            .ToListAsync();

        return new ResponseMessage<List<DonationEventGetDto>>()
        {
            Success = true,
            Message = "DonationEvents retrieved successfully.",
            Data = donationEvents

        };
    }
    catch (Exception e)
    {
        Console.WriteLine(e);
        throw;
    }


}

public async Task<ResponseMessage<DonationEventGetDto?>> GetByIdDonation(Guid id)
{
    try
    {
        var donationEvent = await _dbContext.DonationEvents.Where(x=>x.Id==id).Select(x=> new DonationEventGetDto
            {
                    
                Id = x.Id.ToString(),
                Title = x.Title,
                SubTitle = x.SubTitle,
                Description = x.Description,
                IsDonation = x.IsDonation,
                Amount = x.Amount,
                AmountCollected = _dbContext.DonationEventDetails.Where(y=>y.DonationEventId == id &&y.IsPaid).Sum(z=>z.Amount),
                ImagePath = x.ImagePath
            })
                
            .FirstOrDefaultAsync();;

        return new ResponseMessage<DonationEventGetDto?>()
        {
            Success = true,
            Data = donationEvent 
        };

    }
    catch (Exception e)
    {
        return ExceptionHandler.HandleException<DonationEventGetDto>(e);
    }

   
}

private async Task<string> SaveImageAsync(IFormFile imageFile)
{
    var fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
    var filePath = Path.Combine("wwwroot/images", fileName);

    await using var stream = new FileStream(filePath, FileMode.Create);
    await imageFile.CopyToAsync(stream);

    return $"/images/{fileName}";
}




public async Task<ResponseMessage<string>> MakePayment(DonationPaymentDto donationPaymentDto)
{

    try
    {
        DonationEventDetail donationEventDetail = new DonationEventDetail()
        {
            Id = Guid.NewGuid(),
            DonationEventId = donationPaymentDto.EventId != Guid.Empty ? donationPaymentDto.EventId : null,
            Text_Rn = donationPaymentDto.Text_Rn,
            Amount = donationPaymentDto.Payment,
            CreatedDate = DateTime.Now,
            Rowstatus = EnumList.RowStatus.ACTIVE

        };


        await _dbContext.DonationEventDetails.AddAsync(donationEventDetail);
        await _dbContext.SaveChangesAsync();
        return new ResponseMessage<string>
        {
            Data = donationEventDetail.Id.ToString(),
            Message = "Added Successfully",
            Success = true
        };
    }
    catch (Exception ex)
    {
        return ExceptionHandler.HandleException<string>(ex);
    }
}


 public async Task<ResponseMessage<string>> MakePaymentConfirmation(string txt_rn,string phoneNumber)
        {

            try
            {
                var currentPayment = await _dbContext.DonationEventDetails.Where(x => x.Text_Rn.ToLower() == txt_rn.ToLower())
                    .FirstOrDefaultAsync();

                if (currentPayment != null)
                {
                    currentPayment.IsPaid = true;
                    currentPayment.PhoneNumber = phoneNumber;

                    await _dbContext.SaveChangesAsync();


                    var messageen = $"Congratulations!\n" + 
                                    $"We are delighted to confirm that we have received your payment. Thank you for your generous donation to the ABI-ZEER Association.\n\n" +
                                    $"You can visit our site https://abizeermembership.com for more information.\n\n" +
                                    $"We truly appreciate your support.";

                    var messageam = $"እንኳን ደስ አለዎት!\n" +
                                    $"ክፍያዎት ደርሶናል። ለአቢ-ዝር ማህበር ስላደረጉት በጎ መዋጮ እናመሰግናለን።\n\n" +
                                    $"ለበለጠ መረጃ እባኮትን ድህረ ገፃችንን በ https://abizeermembership.com ይጎብኙ።\n\n" +
                                    $"ድጋፍህን ከልብ እናመሰግናለን።";



                    var messageRequestEn = new MessageRequest
                    {
                        PhoneNumber = phoneNumber,
                        Message = messageen
                    };
                    var messageRequestam = new MessageRequest
                    {
                        PhoneNumber = phoneNumber,
                        Message = messageam
                    };
                    await _generalConfig.SendMessage(messageRequestEn);
                    await _generalConfig.SendMessage(messageRequestam);

                    return new ResponseMessage<string>()
                    {
                        Success = true,
                        Message = "We are delighted to confirm that we have received your payment",
                        Data = "Thank you for your generous donation to the ABI-ZEER Association"
                    };
                }
                else
                {



                    return new ResponseMessage<string> { Success = false, Message = "Unable To Find Payment Refernece" };
                }
            }
            catch (Exception ex)
            {
                return ExceptionHandler.HandleException<string>(ex);
            }


        }

}