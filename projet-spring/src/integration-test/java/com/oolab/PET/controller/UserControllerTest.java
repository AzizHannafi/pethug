package com.oolab.PET.controller;


//
//@ExtendWith(SpringExtension.class)
//@SpringBootTest(
//		webEnvironment = WebEnvironment.RANDOM_PORT,
//		classes = {PetApplication.class, MysqlConfig.class}) //MysqlConfig Config another DataSource for tests purposes
//@AutoConfigureMockMvc
//@ActiveProfiles("integration-test")
//@TestMethodOrder(OrderAnnotation.class)
//@Tag("integration")
//@WithMockUser(username = "admin", password = "admin", authorities = {"ROLE_ADMINSYSTEM"})
//public class UserControllerTest {
//
//	//@Autowired
//	private MockMvc mvc;
//
//	@Autowired
//	private WebApplicationContext context;
//
//	@Autowired
//	private PersonService service;
//
//	@BeforeEach
//	public void setup() {
//
//		mvc = MockMvcBuilders.webAppContextSetup(context)
//				.apply(springSecurity())
//				.build();
//
//	}
//
//	ObjectMapper mapper = new ObjectMapper();
//	String resultContent = null;
//
//	@Test
//	@Order(1)
//	public void createPersonTest() throws Exception {
//		//Arrange
//		Person p = new Person("Cheikh", "ANTA DIOP", "Historien", "000000010", "Senegal");
//		String person = mapper.writeValueAsString(p);
//		this.mvc.perform(post("/persons")
//				.content(person)
//				.contentType(MediaType.APPLICATION_JSON))
//				.andExpect(status().isOk())
//				.andDo(print());
//	}
//
//	@Test
//	@Order(2)
//	public void deletePersonTest() throws Exception {
//		//Act
//		Person p = service.getByTel("000000010");
//		if(Objects.nonNull(p))
//			this.mvc.perform(delete("/persons/"+p.getIdPerson())
//				.contentType(MediaType.APPLICATION_JSON)
//				.accept(MediaType.APPLICATION_JSON))
//				.andExpect(status().isOk())
//				.andDo(print());
//
//	}
//}