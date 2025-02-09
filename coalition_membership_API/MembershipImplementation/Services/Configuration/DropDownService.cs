using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Configuration;
using Microsoft.EntityFrameworkCore;

namespace MembershipImplementation.Services.Configuration
{
    public class DropDownService : IDropDownService
    {
        private readonly ApplicationDbContext _dbContext;

        public DropDownService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        
        public async Task<List<SelectListDto>> GetRegionDropdownList(string countryType)
        {
            var countryTypee = Enum.Parse<CountryType>(countryType);
            var regionList = await _dbContext.Regions.Where(x => x.CountryType == countryTypee).AsNoTracking().Select(x => new SelectListDto
            {
                Id = x.Id,
                Name = x.RegionName,
            }).ToListAsync();

            return regionList;
        }

        public async Task<List<SelectListDto>> GetZoneDropdownList(Guid regionID)
        {
            var ZoneList = await _dbContext.Zones.Where(x => x.RegionId == regionID).AsNoTracking().Select(x => new SelectListDto
            {
                Id = x.Id,
                Name = x.ZoneName,

            }).ToListAsync();

            return ZoneList;
        }
        


        public async Task<List<SelectListDto>> GetMembershipTypesDropDown(MemberShipTypeCategory category)
        {
          
            var membershipTypes = await _dbContext.MembershipTypes
                .Where(x => x.MemberShipTypeCategory == category && x.Money!=0)
                .AsNoTracking()
                .Select(x => new SelectListDto
                {
                    Id = x.Id,
                    Name = $"{x.Name}\n" +
                           $"Donation: {x.Money} {x.Currency}\n" +
                           $"Membership: {x.Counter} " +
                           (x.MemberShipTypeCategory == MemberShipTypeCategory.WEEKLY ? "Weeks" :
                               x.MemberShipTypeCategory == MemberShipTypeCategory.MONTHLY ? "Months" :
                               "Years"),
                    Amount = x.Money
                })
                .ToListAsync();

            return membershipTypes;
        }
        
        
        

    }
}
